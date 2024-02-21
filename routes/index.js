import express from 'express';
import { __routesUsers } from './routes.users.js';
import { __routesRoles } from './routes.roles.js';
import { __routesProvinces } from './routes.provinces.js';
import { _routesterritoires } from './routes.territoires.js';
import { _routesVillage } from './routes.village.js';
import { __routesServices } from './routes.services.js';
import { __routesLaboratories } from './routes.guichets.js';
import { __routesCategories } from './routes.categories.js';
import { __routesSubcategories } from './routes.subcategories.js';
import { __routesUnities } from './routes.unities.js';
import { __routesProduits } from './routes.produits.js';
import { __routesStores } from './routes.store.js';

export const Routes = express.Router();
Routes.use('/users', __routesUsers)
Routes.use('/roles', __routesRoles)
Routes.use('/provinces', __routesProvinces)
Routes.use('/territoires', _routesterritoires)
Routes.use('/villages', _routesVillage)
Routes.use('/services', __routesServices)
Routes.use('/guichets', __routesLaboratories)
Routes.use('/categories', __routesCategories)
Routes.use('/subcategories', __routesSubcategories)
Routes.use('/unities', __routesUnities)
Routes.use('/produits', __routesProduits)
Routes.use('/stores', __routesStores)
