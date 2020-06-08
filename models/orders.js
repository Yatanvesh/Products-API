const cuid = require('cuid');
const {isEmail} = require('validator');

const db = require('../db');

module.exports= {
    get,
    create,
    list
}
const Order = db.model('Order', {
  _id:{type:String, default:cuid},
  buyerEmail:emailSchema({required:true}),
  products:[{type:String, ref:'Product', index:true,required:true}],
  status: { type:String, index:true, default:'CREATED', enum: ['CREATED', 'PENDING', 'COMPLETED']}
})

async function get (_id) {
    const order = await Order.findById(_id)
    .populate('products')
    .exec()
    return order
}

function emailSchema (opts = {}) {
    const { required } = opts
    return {
    type: String,
    required: !!required,
    validate: {
    validator: isEmail,
    message: props => `${props.value} is not a valid Email`
    }
  }
}


async function list(opts = {}) {
    const {
        offset = 0, limit = 25, tag
    } = opts;
    const orders = await Order.find()
        .sort({
            _id: 1
        })
        .skip(offset)
        .limit(limit)
        .populate('products')
        .exec();
    return orders;
}

async function create(fields) {
    const order = await new Order(fields).save()
    return order;
}