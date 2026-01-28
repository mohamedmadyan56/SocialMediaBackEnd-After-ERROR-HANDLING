const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
    username: {
    type: String,
    required: [true, 'Username is required'],
    min: 3,
    max: 20,
    unique: true,
  },email: {
    type: String,
    required: [true, 'Email is required'],
    max: 50,
    unique: true,
    lowercase: true
  },password: {
    type: String,
    required: [true, 'Password is required'],
    min: 6,
    select:false,
  },profilePicture: {
    type: String,
    default: "",
  },
  coverPicture: {
    type: String,
    default: "",
  },
  // الحقول اللي في الصورة بالظبط
  followers: {
    type: Array,
    default: [], // بتبدأ بمصفوفة فاضية
  },
  followings: { // ملحوظة: هي مكتوبة في الصورة followins (بالـ n)
    type: Array,
    default: [],
  },
  isAdmin: {
    type: Boolean,
    default: false, // أي مستخدم جديد مش بيكون أدمن تلقائياً
  },
  desc: {
    type: String,
    max: 50,
  },
  city: {
    type: String,
    max: 50,
  },
  from: {
    type: String,
    max: 50,
  },relationship: {
    type: Number,
    enum: [1, 2, 3], // مثال للـ Built-in Validator (1: Single, 2: Married...)
  },

},
{ timestamps: true }

)




const user = module.exports = mongoose.model('User',UserSchema);