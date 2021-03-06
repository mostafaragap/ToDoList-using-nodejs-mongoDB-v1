//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require('lodash');

const app = express();
const mongoose = require('mongoose');
const url ="mongodb+srv://mostafa:01006092170@cluster0.w3ozq.mongodb.net/toDoListDB?retryWrites=true&w=majority" ;


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect(url) ;

const itemsSchema = mongoose.Schema(
  {
  name: String
  }
);

const Item = mongoose.model('Item' ,itemsSchema ) ;

const item1 = new Item (
  {
    name : "Welcome to your todoList"
  }
);
const item2 = new Item (
  {
    name : "Hit the (+) button to add a new item"
  }
);
const item3 = new Item (
  {
    name : "<--- Hit this to delete an item"
  }
);

const defaultItems = [item1 , item2 , item3];

const ListSchema = mongoose.Schema({
  name : String ,
  items : [itemsSchema]
});

const List = mongoose.model("List" ,ListSchema ) ;


app.get("/", function(req, res) {

  Item.find((err,foundsItems)=>
  {
    if(err){console.log(err);}else{
      if(foundsItems.length === 0 ){
        List.find((err,lists)=>
      {
        if(!err)
        {
            res.render("list", {listTitle: "Today", newListItems: foundsItems , listsname:lists});
        }
      });
        Item.insertMany(defaultItems , (err)=>
        {
          if(err){console.log(err);}else{console.log("succecfully saved");}
        });
        res.redirect("/");
      }else{
        List.find((err,lists)=>
      {
        if(!err)
        {
            res.render("list", {listTitle: "Today", newListItems: foundsItems , listsname:lists});
        }
      });

      }

      }

  });



});

app.post("/addCustomList" , (req,res)=>
{
    const array =[];
  List.find((err,items)=>
{
  if(!err)
  {
    items.forEach((item) =>
  {
    array.push(item);
  });
  const newListName =  _.capitalize(req.body.customList) ;
  List.findOne({name:newListName} , (err,result)=>{
    if(err){console.log(err);}
    else{
      if(!result){
        const list = new List(
          {
            name : newListName ,
            items : [item1 , item2 , item3]
          }
        );
        list.save();
        res.redirect("/custom/"+ newListName);
      }else {
          res.render("list", {listTitle:newListName ,listsname:array, newListItems: result.items});
          console.log("Exist list name");
      }

    }

  });
  }
});



});




app.post("/", function(req, res){

  const item = req.body.newItem;
  const listName =req.body.list;
   if(item !== null && item !==" "){
     const newItem = new Item(
       {
      name : item
       }
     );
     if(listName === "Today")
     {
       newItem.save();
       res.redirect("/");
     }else{
       console.log(listName);
      List.findOne({name:listName} , (err , result) =>{
  if(err)
  {
    console.log(err);

  }else
  {
    result.items.push(newItem);
    result.save();
    res.redirect("/custom/"+ listName);
  }
});

     }

   }else{
     console.log("please Type Any thing todo!!");
   }


});

app.post("/delete" , (req,res)=>
{
  const removedItem = req.body.remove ;
  const valueOfListTitle = req.body.listTitle ;
  if(valueOfListTitle === "Today")
  {
    Item.deleteOne({_id :removedItem} , (err)=>
  {
    if(err){console.log(err);}else{
      res.redirect("/");
      console.log("Item is removed");
    }
  });
}else
{
  List.findOneAndUpdate({name :valueOfListTitle } , {$pull : {items :{_id:removedItem} }} , (err , results)=>{
    if(err){console.log(err);} else
    {
      res.redirect("/custom/"+valueOfListTitle );
    }
  });
}


});

app.get("/custom/:custmListName", function(req,res){

const newListName = req.params.custmListName;
const array =[] ;
List.find((err,results) =>
{
  if(!err){

  results.forEach((item) => {
    array.push(item);

  });

  List.findOne({name:newListName} , (err,result)=>{
    if(err){console.log(err);}
    else{

   res.render("custom", {listTitle: newListName, listsname :array, newListItems: result.items });


    }

  });
  }
});



});



app.get("/about", function(req, res){
  List.findOne({name:newListName} , (err,result)=>{
    if(err){console.log(err);}
    else{
      List.find((err,lists)=>
    {
      if(!err)
      {
        res.render("about",{newListItems: result.items , listsname:lists});
      }
    });





    }

  });
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
