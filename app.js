const express = require("express");
const app = express();
const port = 8080;
const mongoose = require("mongoose");
const Listing = require("./models/listing.js")
const Booking = require("./models/booking.js")
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";


const main = async () => {
    await mongoose.connect(MONGO_URL);
};

main().then(() => { 
    console.log("Connected to db")
}).catch((err)=>{
    console.log(err)
})

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'))
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")))

// Index Route
app.get("/listings", wrapAsync (async (req, res) => {
    const allListings = await Listing.find({})
    res.render("listings/index.ejs", {allListings})
}));

// New Route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs")
});

// Create Route
app.post("/listings", wrapAsync (async (req, res,next) => {
        // let {title, descripton, image, price, location, country} = req.body
        if(!req.body.listing){
            throw new ExpressError(400, "Send Valid Data For Listing");
        }
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
    
}));



// Show Route
app.get("/listings/:id", wrapAsync (async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", {listing})
}));



// Edit Route
app.get("/listings/:id/edit",wrapAsync(async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

// Update Route
app.put("/listings/:id", wrapAsync(async(req,res) => {
    if(!req.body.listing){
            throw new ExpressError(400, "Send Valid Data For Listing");
        }
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing})
    res.redirect(`/listings/${id}`);
}));



// Delete Route
app.delete("/listings/:id", wrapAsync(async(req,res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings")
}));



// Booking Show Route
app.get("/listings/:id/book", wrapAsync(async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/booking.ejs", {listing});
}));

// Booking Route
app.post("/booking", wrapAsync(async (req, res) => {
        // let {title, descripton, image, price, location, country} = req.body
        const newBooking = new Booking(req.body.listing);
        await newBooking.save();
        res.redirect("/listings");
}));

// Cearting a middleware for custom error for db
// app.use((err, req, res, next) =>{
//     res.send("Something Went Wrong")
// })


app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
})

app.use((err, req, res, next) =>{
    let{statusCode=500, message="Something Went Wrong!"} = err;
    res.status(statusCode).render("listings/error.ejs", {message})
    // res.status(statusCode).send(message);
});


// app.get("/testlisting", async (req,res)=>{
//     let sampleListing = new Listing({
//         title: "My new villa",
//         description: "Near the beach",
//         price: 9900,
//         location: "Juhu, Mumbai",
//         country: "India"

//     })

//     await sampleListing.save()
//     console.log("sample was saved")
//     res.send("Successfull testing");
// });

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
