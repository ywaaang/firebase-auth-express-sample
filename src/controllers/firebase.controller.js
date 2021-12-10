const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const admin = require('firebase-admin');
const serviceAccount = require('../../firebase.json');
const { userService } = require('../services');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = getFirestore();

const test = catchAsync((req, res) => {
  res.send('success')
})

// const db = admin.database();
const getList = catchAsync(async (req, res) => {
  admin.auth()
    .listUsers(1000)
    .then(async (listUsersResult) => {
      const usersRef = db.collection('users');
      const usersData = await usersRef.get();
      const userRoleList = []
      usersData.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
        userRoleList.push({
          id: doc.id,
          role: doc.data().role
        })
      });
      const result = []
      listUsersResult.users.forEach((userRecord) => {
        const data = userRecord.toJSON()
        const temp = userRoleList.find(item => item.id === data.uid) || {}
        data.role = temp.role || ''
        result.push(data)
      });
      if (listUsersResult.pageToken) {
        // List next batch of users.
        listAllUsers(listUsersResult.pageToken);
      }
      res.send({data: result, code: 200});
    })
    .catch((error) => {
      console.log('Error listing users:', error);
      res.send({message: error.message, code: 500});
    });
});

const createUser = catchAsync((req, res) => {
  const query = req.body;
  console.log(query)
  admin.auth()
  .createUser({
    email: query.email,
    emailVerified: true,
    phoneNumber: query.phone,
    password: query.password,
    displayName: query.name,
    photoURL: 'http://www.example.com/12345678/photo.png',
    disabled: false,
  })
  .then((userRecord) => {
    console.log('Successfully updated user', userRecord.toJSON());
    const uid = userRecord.toJSON().uid
    const data = {
      role: query.role
    }
    db.collection('users').doc(uid).set(data).then(() => {
      res.send({
        msg: 'Successfully creating new user:',
        code: 200
      })
    }).catch(err => {
      console.log(err)
      res.send({
        code: 500,
        msg: err.message
      })
    })
  })
  .catch((error) => {
    console.log('Error creating new user:', error);
    res.send({
      msg: error.message,
      code: 500
    })
  });
})

const updateUser = catchAsync((req, res) => {
  const query = req.body;
  const uid = query.id
  console.log(query)
  const userInfo = {
    email: query.email,
    phoneNumber: query.phone,
    emailVerified: true,
    displayName: query.name,
    photoURL: 'http://www.example.com/12345678/photo.png',
    disabled: false,
  }
  if (query.password) {
    userInfo.password = query.password
  }
  admin.auth()
  .updateUser(uid, userInfo)
  .then((userRecord) => {
    const data = {
      role: query.role
    }
    db.collection('users').doc(uid).set(data).then(() => {
      console.log('Successfully updated user', userRecord.toJSON());
      res.send({
        msg: 'Successfully updating new user:',
        code: 200
      })
    }).catch(err => {
      console.log(err)
      res.send({
        code: 500,
        msg: err.message
      })
    })
  })
  .catch((error) => {
    console.log('Error updating user:', error);
    res.send({
      msg: 'Error',
      code: 500
    })
  });
})


const deleteUser = catchAsync((req, res) => {
  const query = req.body;
  const uid = query.id
  console.log(query)
  admin.auth()
  .deleteUser(uid)
  .then(() => {
    res.send({
      msg: 'Successfully delete user:',
      code: 200
    })
    db.collection('users').doc(uid).delete()
  })
  .catch((error) => {
    console.log('Error deleting user:', error);
    res.send({
      msg: 'Error',
      code: 500
    })
  });
})

module.exports = {
  getList,
  createUser,
  updateUser,
  deleteUser,
  test
};
