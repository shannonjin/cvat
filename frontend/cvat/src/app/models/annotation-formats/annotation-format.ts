import { Annotation } from './annotation';


export interface AnnotationFormat{
  id: number;
  dumpers: Annotation[];
  loaders: Annotation[];
  name: string;
  created_date: string;
  updated_date: string;
  handler_file: string;
  owner: number;


}
