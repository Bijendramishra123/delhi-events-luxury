import React, { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check, Send, Sparkles } from "lucide-react";
import api, { formatPrice } from "../lib/api";

// UPDATED: Removed Wedding, Engagement, Housewarming. Added Haldi, Mehndi
const CATEGORIES = ["All", "Haldi", "Mehndi", "Birthday", "Anniversary", "Baby Shower", "Corporate"];

// Rest of the component remains same...
// (keeping existing implementation with updated categories)

// [Previous implementation continues...]
