const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const Plan = require("../models/plan");

router.get('/', (req, res, next) => {
    Plan.find()
    .select("name fees comments _id")
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            plans: docs.map(doc => {
              return {
                _id: doc._id,
                name: doc.name,
                fees: doc.fees,
                comments: doc.comments,
                request: {
                  type: "GET",
                  url: "http://localhost:3000/plans/" + doc._id
                }
              };
            })
          };
          res.status(200).json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.post('/', (req, res, next) => {
    console.log(req.body);
    const plan = new Plan({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        fees: req.body.fees,
        frequency: req.body.frequency,
        maxdiscount: req.body.maxdiscount,
        comments: req.body.comments,
        validuntil: req.body.validuntil,
        neverexpires: req.body.neverexpires
      });
      plan
        .save()
        .then(result => {
            console.log(result);
            res.status(201).json({
              message: "Created plan successfully",
              createdPlan: {
                  _id: result._id,
                  name: result.name,
                  fees: result.fees,
                  request: {
                      type: 'GET',
                      url: "http://localhost:3000/plans/" + result._id
                  }
              }
            });
          })
        .catch(err => {
          console.log(err);
          res.status(500).json({
            error: err
          });
        });
});

router.get('/:planId', (req, res, next) => {
    const id = req.params.planId;
    Plan.findById(id)
    .select('name fees comments _id')
    .exec()
    .then(doc => {
      console.log("From database", doc);
      if (doc) {
        res.status(200).json({
            plan: doc,
            request: {
                type: 'GET',
                url: 'http://localhost:3000/plans'
            }
        });
      } else {
        res
          .status(404)
          .json({ message: "No valid entry found for provided ID" });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.patch('/:planId', (req, res, next) => {
    const planId = req.params.planId;
    const updateOps = {};
    for (const ops of req.body) {
      updateOps[ops.propName] = ops.value;
    }
    Plan.update({ _id: planId }, { $set: updateOps })
      .exec()
      .then(result => {
        res.status(200).json({
            message: 'Plan updated',
            request: {
                type: 'GET',
                url: 'http://localhost:3000/plans/' + id
            }
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
  });

router.delete('/:planId', (req, res, next) => {
    const planId = req.params.planId;
    Plan.remove({ _id: planId })
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Plan deleted',
            request: {
                type: 'POST',
                url: 'http://localhost:3000/plans',
                body: { name: 'String', fees: 'Number' , comments: 'String' }
            }
        });
      })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;