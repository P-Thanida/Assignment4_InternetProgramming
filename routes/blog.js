var express = require("express")
var router = express.Router()
const db = require("monk")("localhost:27017/ReportPB")
const { check, validationResult, Result, body } = require("express-validator")

/* GET users listing. */
router.get("/", function (req, res, next) {
  const collection = db.get("blogs")
  collection.find({}).then((doc) => {
    if (doc.length > 0) {
      console.log(doc)
      res.render("blog", {
        data: doc,
      })
    } else {
      console.log("Empty!!")
      res.render("blog", {
        data: "",
      })
    }
  })
})

router.get("/edit/(:id)", (req, res, next) => {
  let id = req.params.id
  const collection = db.get("blogs")
  collection.find({ _id: id }).then((doc) => {
    res.render("edit", {
      title: "แก้ไขข้อมูล",
      id: id,
      name: doc[0].name,
      dormitory: doc[0].dormitory,
      room: doc[0].room,
      detail: doc[0].detail,
    })
  })
})

router.post("/edit/(:id)", [
  check("name", "กรุณาป้อนชื่อ-นามสกุล").not().isEmpty(),
  check("dormitory", "กรุณาเลือกหอพัก").not().isEmpty(),
  check("room", "กรุณาป้อนหมายเลขห้อง").not().isEmpty(),
  check("detail", "กรุณาป้อนปัญหาที่เกิดขึ้น").not().isEmpty(),
], (req, res, next) => {

  const collection = db.get("blogs")
  const id = req.params.id

  const result = validationResult(req)
  var errors = result.errors
  if (!result.isEmpty()) {
    collection.find({ _id: id }).then((doc) => {
      res.render("edit", {
        errors: errors,
        title: "แก้ไขข้อมูล",
        id: id,
        name: doc[0].name,
        dormitory: doc[0].dormitory,
        room: doc[0].room,
        detail: doc[0].detail,
      })
    })

  } else {
    collection
      .findOneAndUpdate(
        { _id: id },
        {
          $set: {
            name: req.body.name,
            dormitory: req.body.dormitory,
            room: req.body.room,
            detail: req.body.detail,
          },
        }
      )
      .then(() => {
        res.location("/blog/")
        res.redirect("/blog/")
      })
  }

})

// delete
router.get("/delete/(:id)", (req, res, next) => {
  const collection = db.get("blogs")
  let id = req.params.id
  collection.remove({ _id: id }).then(() => {
    res.location("/blog")
    res.redirect("/blog")
  })
})

router.get("/add", function (req, res, next) {
  res.render("addblog")
})

router.post(
  "/add",
  [
    check("name", "กรุณาป้อนชื่อ-นามสกุล").not().isEmpty(),
    check("dormitory", "กรุณาเลือกหอพัก").not().isEmpty(),
    check("room", "กรุณาป้อนหมายเลขห้อง").not().isEmpty(),
    check("detail", "กรุณาป้อนปัญหาที่เกิดขึ้น").not().isEmpty(),
  ],
  function (req, res, next) {
    const result = validationResult(req)
    var errors = result.errors
    if (!result.isEmpty()) {
      res.render("addblog", { errors: errors })
    } else {
      //insert to db
      var ct = db.get("blogs")
      ct.insert(
        {
          name: req.body.name,
          dormitory: req.body.dormitory,
          room: req.body.room,
          detail: req.body.detail,
        },
        function (err, blog) {
          if (err) {
            res.send(err)
          } else {
            res.location("/blog/")
            res.redirect("/blog/")
            console.log(req.body.name)
            console.log(req.body.dormitory)
            console.log(req.body.room)
            console.log(req.body.detail)
          }
        }
      )
    }
  }
)

module.exports = router
