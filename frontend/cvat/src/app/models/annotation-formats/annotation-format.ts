import { Loader } from './loader';
import { Dumper } from './dumper';

export interface AnnotationFormat{
  id: number;
  dumpers: Dumper[];
  loaders: Loader[];
  name: string;
  created_date: string;
  updated_date: string;
  handler_file: string;
  owner: number;


}
