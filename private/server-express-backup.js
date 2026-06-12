import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';

const app = express();
app.use(express.json());
app.use(cors()); // Allows your Vite frontend to talk to this server

// 1. Connect to your MongoDB Atlas Cluster
const mongoUrl = process.env.MONGO_URL || "set MONGO_URL=mongodb+srv://admin:5151nNzhbGq5OEhi@info4235.lytzr4v.mongodb.net/INFO4235Project?retryWrites=true&w=majority";

mongoose.connect(mongoUrl, {
  dbName: 'INFO4235Project' // Forcibly overrides the default "test" pathing parameter
})
  .then(() => console.log("Successfully connected to database: INFO4235Project"))
  .catch(err => console.error("Database connection error:", err));

// 1. Update Schema to match Meteor's nested structure
const UserSchema = new mongoose.Schema({
  emails: [{
    address: { type: String, required: true },
    verified: { type: Boolean, default: false }
  }],
  password: { type: String } // Leaves room for direct plaintext fallback if needed
}, { strict: false }); // strict: false allows Mongoose to read Meteor's custom fields safely

const User = mongoose.model('User', UserSchema, 'Users');

// 2. Update the Login API Route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  console.log("--- Login Request Received ---");
  console.log("Querying capitalized 'Users' collection for:", email);
  
  try {
    // Search using a logical OR condition to check both common field formats
    const user = await User.findOne({
      $or: [
        { "email": email },
        { "emails.address": email }
      ]
    });

    console.log("Database user match found:", user ? "YES" : "NO");

    if (!user) {
      return res.status(401).json({ success: false, message: "No account found with that email address." });
    }

    let isMatch = false;
    
    // 1. Check for Meteor-style bcrypt hashing
    if (user.services && user.services.password && user.services.password.bcrypt) {
      isMatch = await bcrypt.compare(password, user.services.password.bcrypt);
    } 
    // 2. Check for standard top-level hashed password
    else if (user.password && user.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, user.password);
    }
    // 3. Plaintext fallback
    else if (user.password === password) {
      isMatch = true;
    }

    if (isMatch) {
      console.log("Authentication Successful!");
      return res.json({ success: true, email: email });
    } else {
      console.log("Password verification failed.");
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

  } catch (error) {
    console.error("Database Query Crash:", error);
    res.status(500).json({ success: false, message: "Server database error" });
  }
});

app.get('/api/debug-db', async (req, res) => {
  try {
    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    res.json({
      connectedToDatabase: mongoose.connection.name,
      allAvailableDatabases: dbs.databases.map(d => d.name),
      collectionsInCurrentDb: collections.map(c => c.name)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(5000, () => console.log("Backend API running on port 5000"));