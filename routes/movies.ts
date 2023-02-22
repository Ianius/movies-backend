import { Router } from "express";
import { 
    getPopular, 
    getTrending, 
    getGenres, 
    getSearch, 
    getMovie, 
    getSimilar, 
    getCredits, 
    getImage, 
    getReviews,
    postReview,
    addToList,
    deleteFromList,
    getItemStatus,
    getItemAnyStatus as getItemStatusAny,
    getAllLists,
    getListDetails,
    createList,
    deleteList
} from "../controllers/movies";
import { authenticate } from '../controllers/auth';

const route = Router();

route.get('/image',    getImage);
route.get('/popular',  getPopular);
route.get('/trending', getTrending);
route.get('/genres',   getGenres);
route.get('/search',   getSearch);

route.get('/movie/:id',         getMovie);
route.get('/movie/:id/similar', getSimilar);
route.get('/movie/:id/credits', getCredits);
route.get('/movie/:id/reviews', getReviews);

route.get('/list/:id/details',     authenticate, getListDetails);
route.get('/list/all',             authenticate, getAllLists);
route.get('/list/:id/item_status', authenticate, getItemStatus); // Returns whether or not a list contains an item
route.get('/list/item_status_any', authenticate, getItemStatusAny); // Returns whether or not an item belongs to ANY user-created list

route.post('/list/:id', authenticate, addToList);
route.post('/list',     authenticate, createList);

route.delete('/list/:id', authenticate, deleteFromList);
route.delete('/list',     authenticate, deleteList); // Delete a list

route.post('/reviews', authenticate, postReview);

export default route;
