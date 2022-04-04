const Product = require("../models/productModel.js")
const ErrorHander = require("../utils/errorhander")
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Apifeatures = require("../utils/apiFeatures.js");


//Create A Product -- Admin Route
exports.createProduct = catchAsyncErrors(async (req, res, next) => {

    const adminName = req.user.name;

    req.body.user = req.user.id
    
    const product = await Product.create(req.body);
    res.status(201).json({
        success:true,
        message:`Product ${product.name} created successfully by ${adminName}`,
        product
    });
});

//Update a product -- Admin Route
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {

    const adminName = req.user.name;
    let product = await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHander("Product Not Found", 404))
    }
    product = await Product.findByIdAndUpdate(req.params.id, req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });
    res.status(200).json({
        success:true,
        product,
        message:`Product Updated Successfully by ${adminName}`
    })
})

//Get List of All Products
exports.getAllProducts = catchAsyncErrors(async (req, res) => {
    
    const productPerPage = 8;
    const productCount = await Product.countDocuments()

    const apiFeature = new Apifeatures(Product.find(), req.query)
    .search().filter();

    let products = await apiFeature.query;
    let filteredProductsCount = products.length;
    apiFeature.pagination(productPerPage);

    products = await apiFeature.query 
    res.status(200).json({
        success:true,
        products,
        productCount,
        productPerPage,
        filteredProductsCount
    })
})

//Get Single Product Details
exports.getProductDetails = catchAsyncErrors(async(req, res, next) => {
        
    let product = await Product.findById(req.params.id)
    if(!product){
        return next(new ErrorHander("Product Not Found", 404))
    }
    res.status(200).json({
        success:true,
        product,
    })
})

//Delete a product -- Admin Function
exports.deleteProduct = catchAsyncErrors(async (req,res,next) => {
    

    const adminName = req.user.name;
    
    let product = await Product.findById(req.params.id)
    if(!product){
        return next(new ErrorHander("Product Not Found", 404))
    }

    const productName = product.name
    await product.remove()
    res.status(200).json({
        success:true,
        message:`Product ${product.name} deleted successfully by ${adminName}`,
    })
}) 

// Put/Update Review ; Single User can put multiple reviews. Fix IT!
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
    const { rating, comment, productId } = req.body;
  
    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };
  
    const product = await Product.findById(productId);
  
    const isReviewed = product.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString()
    );
  
    if (isReviewed) {
      product.reviews.forEach((rev) => {
        if (rev.user.toString() === req.user._id.toString())
          (rev.rating = rating), (rev.comment = comment);
      });
    } else {
      product.reviews.push(review);
      product.numOfReviews = product.reviews.length;
    }
  
    let avg = 0;
  
    product.reviews.forEach((rev) => {
      avg += rev.rating;
    });
  
    product.ratings = avg / product.reviews.length;
  
    await product.save({ validateBeforeSave: false });
  
    res.status(200).json({
      success: true,
    });
  });

// Get All Reviews of a product
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// Delete Review
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.reviewId.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});
