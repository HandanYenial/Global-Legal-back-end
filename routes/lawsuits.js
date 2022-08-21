"use strict"; 

const express = require("express");
const router = express.Router({mergeParams: true});//mergeParams: true is needed to access the id of the parent(=employee) in the child(=lawsuit) route
const { BadRequest } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Lawsuit = require("../models/lawsuit");
const jsonschema = require("jsonschema");
const lawsuitNewSchema = require("../schemas/lawsuitNew.json");
const lawsuitUpdateSchema = require("../schemas/lawsuitUpdate.json");
const lawsuitSearchSchema = require("../schemas/lawsuitSearch.json");

