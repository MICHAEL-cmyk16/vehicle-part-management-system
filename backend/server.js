import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';

dotenv.config();
const app=express();
const PORT=process.env.PORT||5000;
app.use(cors());
app.use(express.json());
app.use('/uploads',express.static(path.resolve('uploads')));

const uploadDir=path.resolve('uploads');
if(!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir,{recursive:true});
const storage=multer.diskStorage({
  destination:(req,file,cb)=>cb(null,uploadDir),
  filename:(req,file,cb)=>cb(null,Date.now()+'-'+file.originalname.replace(/[^a-zA-Z0-9._-]/g,'_'))
});
const upload=multer({storage,limits:{fileSize:15*1024*1024}});

const pool=mysql.createPool({
 host:process.env.DB_HOST||'localhost',
 user:process.env.DB_USER||'root',
 password:process.env.DB_PASSWORD||'',
 database:process.env.DB_NAME||'vehicle_part_management',
 waitForConnections:true,connectionLimit:10
});

app.get('/api/health',async(req,res)=>{try{await pool.query('SELECT 1');res.json({ok:true})}catch(e){res.status(500).json({ok:false,error:e.message})}});

app.post('/api/login',async(req,res)=>{
 const {email,password}=req.body;
 const [rows]=await pool.query('SELECT * FROM users WHERE email=?',[email]);
 if(!rows.length)return res.status(401).json({message:'Invalid credentials'});
 const u=rows[0];
 const valid=u.password.startsWith('$2') ? await bcrypt.compare(password,u.password) : password===u.password;
 if(!valid)return res.status(401).json({message:'Invalid credentials'});
 res.json({user_id:u.user_id,name:u.name,email:u.email,role:u.role,phone:u.phone});
});

app.get('/api/dashboard',async(req,res)=>{
 const [[vehicles]] = await pool.query('SELECT COUNT(*) count FROM vehicles');
 const [[parts]] = await pool.query('SELECT COUNT(*) count FROM parts');
 const [[repairs]] = await pool.query('SELECT COUNT(*) count FROM repair_reports');
 const [[mechanics]] = await pool.query("SELECT COUNT(*) count FROM users WHERE role='MECHANIC'");
 const [[manuals]] = await pool.query('SELECT COUNT(*) count FROM manuals');
 const [[cad]] = await pool.query('SELECT COUNT(*) count FROM cad_models');
 res.json({vehicles:vehicles.count,parts:parts.count,repairs:repairs.count,mechanics:mechanics.count,manuals:manuals.count,cad:cad.count});
});

app.get('/api/vehicles',async(req,res)=>{
 const [rows]=await pool.query(`SELECT v.*,u.name owner_name,(SELECT COUNT(*) FROM vehicle_parts vp WHERE vp.vehicle_id=v.vehicle_id) part_count FROM vehicles v LEFT JOIN users u ON v.owner_id=u.user_id ORDER BY v.vehicle_id DESC`);
 res.json(rows);
});
app.post('/api/vehicles',upload.single('image'),async(req,res)=>{
 const {registration_no,brand,model,year,vin,color,owner_id}=req.body;
 const image_url=req.file?`/uploads/${req.file.filename}`:null;
 const [r]=await pool.query(`INSERT INTO vehicles(registration_no,brand,model,year,vin,color,owner_id,image_url) VALUES(?,?,?,?,?,?,?,?)`,
 [registration_no,brand,model,year,vin||null,color||null,owner_id||null,image_url]);
 res.status(201).json({vehicle_id:r.insertId});
});
app.put('/api/vehicles/:id',upload.single('image'),async(req,res)=>{
 const {registration_no,brand,model,year,vin,color,owner_id}=req.body;
 let sql=`UPDATE vehicles SET registration_no=?,brand=?,model=?,year=?,vin=?,color=?,owner_id=?`;
 let vals=[registration_no,brand,model,year,vin||null,color||null,owner_id||null];
 if(req.file){sql+=`,image_url=?`;vals.push(`/uploads/${req.file.filename}`)}
 sql+=' WHERE vehicle_id=?';vals.push(req.params.id);
 await pool.query(sql,vals);res.json({message:'Vehicle updated'});
});
app.delete('/api/vehicles/:id',async(req,res)=>{await pool.query('DELETE FROM vehicles WHERE vehicle_id=?',[req.params.id]);res.json({message:'Vehicle deleted'})});

app.get('/api/owners',async(req,res)=>{const [r]=await pool.query("SELECT user_id,name,email FROM users WHERE role='OWNER' ORDER BY name");res.json(r)});

app.get('/api/parts',async(req,res)=>{
 const [rows]=await pool.query(`SELECT vp.vehicle_part_id,v.vehicle_id,v.registration_no,v.brand,v.model,p.part_id,p.part_number,p.part_name,p.category,p.description,p.manufacturer,q.qr_value
 FROM vehicle_parts vp JOIN vehicles v ON vp.vehicle_id=v.vehicle_id JOIN parts p ON vp.part_id=p.part_id LEFT JOIN qr_codes q ON q.part_id=p.part_id ORDER BY p.part_id DESC`);
 res.json(rows);
});
app.post('/api/parts',async(req,res)=>{
 const {part_number,part_name,category,description,manufacturer,vehicle_id,position_label}=req.body;
 const [p]=await pool.query('INSERT INTO parts(part_number,part_name,category,description,manufacturer) VALUES(?,?,?,?,?)',[part_number,part_name,category,description,manufacturer]);
 const qrValue=`VPM-${part_number}-${p.insertId}`;
 await pool.query('INSERT INTO qr_codes(part_id,qr_value) VALUES(?,?)',[p.insertId,qrValue]);
 if(vehicle_id) await pool.query('INSERT INTO vehicle_parts(vehicle_id,part_id,position_label) VALUES(?,?,?)',[vehicle_id,p.insertId,position_label||'Assembly']);
 res.status(201).json({part_id:p.insertId,qr_value:qrValue});
});
app.put('/api/parts/:id',async(req,res)=>{
 const {part_number,part_name,category,description,manufacturer}=req.body;
 await pool.query('UPDATE parts SET part_number=?,part_name=?,category=?,description=?,manufacturer=? WHERE part_id=?',[part_number,part_name,category,description,manufacturer,req.params.id]);
 res.json({message:'Part updated'});
});
app.delete('/api/parts/:id',async(req,res)=>{await pool.query('DELETE FROM parts WHERE part_id=?',[req.params.id]);res.json({message:'Part deleted'})});

app.get('/api/parts/qr/:value',async(req,res)=>{
 const [rows]=await pool.query(`SELECT vp.vehicle_part_id,v.*,p.*,q.qr_value,vp.position_label
 FROM qr_codes q JOIN parts p ON q.part_id=p.part_id LEFT JOIN vehicle_parts vp ON vp.part_id=p.part_id LEFT JOIN vehicles v ON vp.vehicle_id=v.vehicle_id WHERE q.qr_value=? LIMIT 1`,[req.params.value]);
 if(!rows.length)return res.status(404).json({message:'QR code not found'});res.json(rows[0]);
});
app.get('/api/parts/:id',async(req,res)=>{
 const [p]=await pool.query('SELECT p.*,q.qr_value FROM parts p LEFT JOIN qr_codes q ON q.part_id=p.part_id WHERE p.part_id=?',[req.params.id]);
 if(!p.length)return res.status(404).json({message:'Part not found'});
 const [manuals]=await pool.query('SELECT * FROM manuals WHERE part_id=?',[req.params.id]);
 const [cad]=await pool.query('SELECT * FROM cad_models WHERE part_id=?',[req.params.id]);
 const [history]=await pool.query(`SELECT r.*,u.name mechanic_name,v.registration_no,v.brand,v.model FROM repair_reports r JOIN users u ON r.mechanic_id=u.user_id JOIN vehicle_parts vp ON r.vehicle_part_id=vp.vehicle_part_id JOIN vehicles v ON vp.vehicle_id=v.vehicle_id WHERE vp.part_id=? ORDER BY r.repair_date DESC`,[req.params.id]);
 res.json({...p[0],manuals,cad,history});
});
app.get('/api/qr/:partId',async(req,res)=>{
 const [r]=await pool.query('SELECT q.qr_value,p.part_name,p.part_number FROM qr_codes q JOIN parts p ON p.part_id=q.part_id WHERE p.part_id=?',[req.params.partId]);
 if(!r.length)return res.status(404).json({message:'QR not found'});
 const data=await QRCode.toDataURL(r[0].qr_value,{width:500,margin:2,color:{dark:'#111827',light:'#ffffff'}});
 res.json({...r[0],data});
});

app.post('/api/manuals',upload.single('file'),async(req,res)=>{
 const {part_id,title,version}=req.body;
 const file_url=req.file?`/uploads/${req.file.filename}`:'#';
 const [r]=await pool.query('INSERT INTO manuals(part_id,title,file_url,version) VALUES(?,?,?,?)',[part_id,title,file_url,version||'1.0']);
 res.status(201).json({manual_id:r.insertId,file_url});
});
app.post('/api/cad',upload.single('file'),async(req,res)=>{
 const {part_id,title,model_type,description}=req.body;
 const model_url=req.file?`/uploads/${req.file.filename}`:'#';
 const [r]=await pool.query('INSERT INTO cad_models(part_id,title,model_type,model_url,description) VALUES(?,?,?,?,?)',[part_id,title,model_type||'3D',model_url,description||'']);
 res.status(201).json({cad_id:r.insertId,model_url});
});

app.post('/api/repairs',async(req,res)=>{
 const {vehicle_part_id,mechanic_id,repair_date,problem,action_taken,remarks,cost}=req.body;
 await pool.query(`INSERT INTO repair_reports(vehicle_part_id,mechanic_id,repair_date,problem,action_taken,remarks,cost) VALUES(?,?,?,?,?,?,?)`,
 [vehicle_part_id,mechanic_id,repair_date,problem,action_taken,remarks,cost||0]);
 res.json({message:'Repair report saved'});
});
app.get('/api/maintenance/:ownerId',async(req,res)=>{
 const [r]=await pool.query(`SELECT m.*,v.registration_no,v.brand,v.model FROM maintenance m JOIN vehicles v ON m.vehicle_id=v.vehicle_id WHERE v.owner_id=? ORDER BY m.due_date`,[req.params.ownerId]);res.json(r)
});
app.listen(PORT,()=>console.log(`AutoCore API running on http://localhost:${PORT}`));
