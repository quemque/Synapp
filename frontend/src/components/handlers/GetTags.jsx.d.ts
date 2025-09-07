import { ReactElement } from "react";
import {
  getCategoryColor,
  getCategoryIcon,
  getCategoryName,
} from "./handlers/GetTags.jsx";

export declare const getCategoryColor: (category: string) => string;
export declare const getCategoryIcon: (category: string) => ReactElement;
export declare const getCategoryName: (category: string) => string;
