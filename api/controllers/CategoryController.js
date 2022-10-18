/* global sails, Screentracking, PaymentManagement, User */
/**
 * CategoryController
 *
 * @description :: Server-side logic for managing Categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var moment = require('moment');

var Q = require('q'),
ObjectId = require('mongodb').ObjectID,
_ = require('lodash');

//ObjectId = require('mongodb').ObjectID;

module.exports = {
	createCategoryList: createCategoryListAction,
	updateCategory: updateCategoryAction,
	getAllCategory: getAllCategoryAction,
	deleteCategoryList: deleteCategoryListAction,
	getCategory: getCategoryAction,
	showAll: showAllAction,
	createCategoryView: createCategoryViewAction,
	showOneCategory: showOneCategoryAction,
	UpdateCategoryView: UpdateCategoryViewAction,
	getDashboardView: getDashboardView
};

function showAllAction(req, res) {
  Category
    .getAll()
    .then(function (categories) {
      console.log("here is the list of the categories",categories);
      var rs = {
        categories: categories
      };
      res.view("admin/category/categoryList", rs);
    })
    .catch(function (err) {
      var errors = err.message;
      req.flash("errors", errors);
      res.view("admin/category/categoryList", {
        errors: req.flash("errors")
      });
    });
}

function createCategoryListAction(req, res) {
  if (!req.form.isValid) {
    var validationErrors = ValidationService
      .getValidationErrors(req.form.getErrors());
    return res.failed(validationErrors);
  }

  Category
    .createCategory(req.form)
    .then(function (category) {
      return res.redirect("admin/category-list");
    })
    .catch(function (err) {
      return res.handleError(err);
    });
}

function updateCategoryAction(req, res) {
  Category
    .updateCategory(req.form)
    .then(function (category) {
      res.redirect("admin/category-list");
    })
    .catch(function (err) {
      return res.handleError(err);
    });
}


function getAllCategoryAction(req, res) {
  Category
    .getAllForCategory(req.form)
    .then(function (category) {
      return res.success(category);
    })
    .catch(function (err) {
      return res.handleError(err);
    });
}

function deleteCategoryListAction(req, res) {
  var id = req.param('id');
  Category
    .deleteCategory(id)
    .then(function () {
      res.redirect("admin/category-list");
    })
    .catch(function (err) {
      return res.handleError(err);
    });
}

function getCategoryAction(req, res) {
  var data = [];
  Category
    .getAllCategoryList()
    .then(function (categories) {
      _.forEach(categories, function (category) {
        data.push(category.toCategoryApi());
      });
      return res.success(data);
    })
    .catch(function (err) {
      return res.handleError(err);
    });
}

function createCategoryViewAction(req, res) {
  return res.view('admin/category/createCategory');
}

function showOneCategoryAction(req, res) {
  var id = req.param('id');
  console.log("id value: ", id);
  Category
    .getOneCategory(id)
    .then(function (category) {
      var rs = {
        category: category
      };
      res.view("admin/category/categoryDetail", rs);
    })
    .catch(function (err) {
      var errors = err.message;
      req.flash("errors", errors);
      res.view("admin/detail", {
        errors: req.flash("errors"),
        layout: 'layout'
      });
    });
}

function UpdateCategoryViewAction(req, res) {
  id = req.param('id');
  Category
    .findOne({
      id: id
    })
    .then(function (category) {
      return res.view('admin/category/updateCategory', {
        category: category
      });
    })
    .catch(function (err) {
      var errors = err.message;
      req.flash("errors", errors);
      res.view("admin/detail", {
        errors: req.flash("errors"),
        layout: 'layout'
      });
    });
}

async function getDashboardView( req, res ) {
	const tplData = {};
	// tplData.incompleteCount = 0;
	tplData.pendingCount = 0;
	tplData.freshLeadsCount = 0
	tplData.approvedCount = 0;
	tplData.performingCount = 0;
	tplData.completedCount = 0;
	tplData.chargeoffCount = 0;
	tplData.deniedCount = 0;
	tplData.allpatientCount = 0;
	try {
		// tplData.incompleteCount = await Screentracking.count( { iscompleted: 0, moveToArchive: { $ne: 1 } } );
        tplData.freshLeadsCount = await AchService.getFreshLeadsCount({
            $and:[
                {$or: [{iscompleted: 0}, {iscompleted: 1, "paymentData.status":  PaymentManagement.paymentManagementStatus.origination}]},
                {$or: [ { moveToArchive: { $exists: false } }, { moveToArchive: { $eq: 0, $exists: true } } ]},
                {$or: [ { "userData.leadReject": { $exists: false } }, { "userData.leadReject": { $eq: false, $exists: true } } ]},
            ],
        })
        
		tplData.pendingCount = await PaymentManagement.count( { status: "PENDING" } );
		// tplData.approvedCount = await PaymentManagement.count( { status: "ACTIVE" } );
		tplData.performingCount = await PaymentManagement.count( { status: "ACTIVE" } );
		tplData.completedCount = await PaymentManagement.count( { status: "COMPLETED" } );
		tplData.chargeoffCount = await PaymentManagement.count( { status: "CHARGEOFF" } );
        const checkCreatedDate = moment().startOf('day').subtract(60, "days");
		tplData.deniedCount = await PaymentManagement.count({
            status:['OPENED','DENIED'],
            achstatus: { $eq: 2, $exists: true },
            $and: [
                {$or : [ { moveToArchive:{ $eq: 0, $exists: true } },
                        { $and: [
                                { moveToArchive:{ $exists: false }},
                                { createdAt:{ $gte : checkCreatedDate.toDate(), $exists: true } }
                            ]
                        }
                    ]},
                //{$or : [ { appverified: { $eq: 1, $exists: true } }, { appverified:{ $exists: false }}  ]}
            ]
        } );
		tplData.allpatientCount = await User.count( { email: { $exists: true } } );
		return res.view( "admin/dashboard", tplData );
	} catch ( err ) {
		sails.log.error( "CategoryController.getDashboardView ::err message ", err );
		tplData.err = err;
		return res.view( "admin/dashboard", tplData );
	}
}
