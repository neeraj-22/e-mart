class Apifeatures{
    constructor(query, queryStr){
        this.query = query;
        this.queryStr = queryStr;
    }

    search(){
        const keyword = this.queryStr.keyword ? {
            name:{
                $regex:this.queryStr.keyword,
                $options:"i",
            }
        } : {};

        this.query = this.query.find({...keyword});
        return this;
    }

    filter(){
        const queryCopy = {...this.queryStr}
        
        //Removing fields for category
        const removeFields = ["keyword","page","limit"];
        removeFields.forEach(key => delete queryCopy[key])
        
        //Filter for Price and rating
    
        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|gte)\b/g, key => `$${key}`)

        this.query = this.query.find(JSON.parse(queryStr));
    
        return this;
    }

    pagination(productPerPage){
        const currentPage = Number(this.queryStr.page) || 1; 

        const skip = productPerPage*(currentPage - 1)

        this.query = this.query.limit(productPerPage).skip(skip);

        return this;
    }
};

module.exports = Apifeatures