const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');

const moongose = require('mongoose');
const mySecret = process.env['MONGO_URI']
moongose.connect(mySecret, { useNewUrlParser: true, useUnifiedTopology: true });




app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const userSchema = new moongose.Schema({
  username: {type: String, required: true},
  count: {type: Number},
  logs:[{
    date: { type : Date },
    description : { type : String},
    duration: {type : Number }
  }]
});

const User = moongose.model('User', userSchema);


app.post('/api/users', async (req, res) => {
  const user = req.body.username
  const userCount = await User.countDocuments();
  const count = userCount + 1;
  const newUser = new User({username:user, count:count});
  await newUser.save();
  res.json({ username: user, id: newUser._id });

});


app.post('/api/users/:_id/exercises', async (req, res) => {
  
  description = req.body.description
  duration = req.body.duration
  date = req.body.date

  const update = {
    date: new Date(date),
    description: description,
    duration: Number(duration) 
  };

  const updatedUser = await User.findByIdAndUpdate(
    req.params._id,
    { $push: { logs: update } }, 
    { new: true } 
  ); 

  if (!updatedUser) return res.status(404).send("No user with that ID");
  
  const latestLog = updatedUser.logs[updatedUser.logs.length - 1]; 
  
  dateS = new Date(latestLog.date).toDateString();

  console.log(dateS)

  res.json({
    username: updatedUser.username,
    description: latestLog.description,
    duration: latestLog.duration,
    date: dateS,
    _id: updatedUser._id,
  });
});


app.get('/api/users/:_id/logs', async (req, res) => {
  
  let userlog = await User.findOne({_id: req.params._id})
  
  console.log(userlog)
  res.json(
    {
      username: userlog.username,
      count: userlog.count,
      _id: userlog._id,
      log: userlog.logs
    }
  )

});






const listener = app.listen(process.env.PORT || 3000, () => {
  console.log(' "Cmd + Click" to go to your app'); 
  console.log( 'http://localhost:' + listener.address().port);
  // console.log('Your app is listening on port ' + listener.address().port)
})




  // Checks for missing properties and returns a error message if they are not present
  // if(!date || !description || !duration ) {
  //     return res.status(400).send('Missing data').end();
  // } else if( isNaN(duration)){
  //   return res.status(400).send('Duration must be a number').end();
  // }else{
    // res.json(
    //   {
    //     username: user.username,
    //     description: user.logs.description,
    //     duration: user.logs.duration,
    //     date: user.logs.date,
    //     _id: user._id,
    //   }
    // );
  // }
