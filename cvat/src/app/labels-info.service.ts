import { Injectable } from '@angular/core';
import { Label } from './models/task/label';

@Injectable({
  providedIn: 'root'
})
export class LabelsInfoService {

  constructor() { }


  /**
   * Converts an array of type Label to a string
   * @param deserialized array of type label that is to be seralized
   *                      i.e condensed into a string
   * @return      type string
   */
  static serialize(deserialized: Label[]): string{

    let serialized = '';
        for (const label of deserialized) {
            serialized += ` ${label.name}`;
            for (const attr of label.attributes) {
                serialized += ` ${attr.mutable ? '~' : '@'}`;
                serialized += `${attr.input_type}=${attr.name}:`;
                serialized += attr.values.join(',');
            }
        }
        return serialized.trim();
    }


    /**
     * Converts a string to an array of type Label. Similar to
     * deseralize function found in cvat backend LabelsInfo.js
     *
     * @param serialized string that is to be deseralized
     *                      i.e broken into separate Labels and stored in an array
     * @return      type  Label[]
     */
    static deserialize(serialized: string): Label[] {
        const normalized = serialized.replace(/'+/g, '\'').replace(/\s+/g, ' ').trim();
        const fragments = LabelsInfoService.customSplit(normalized, ' ');

        const deserialized: Label[]= [];
        let latest = null;
        for (let fragment of fragments) {
            fragment = fragment.trim();
            if ((fragment.startsWith('~')) || (fragment.startsWith('@'))) {
                const regex = /(@|~)(checkbox|select|number|text|radio)=(.+):(.+)/g;
                const result = regex.exec(fragment);
                if (result === null || latest === null) {
                    throw Error('Bad labels format');
                }

                const values = LabelsInfoService.customSplit(result[4], ',');
                latest.attributes.push({
                    name: result[3].replace(/^"/, '').replace(/"$/, ''),
                    mutable: result[1] === '~',
                    input_type: result[2],
                    default_value: values[0].replace(/^"/, '').replace(/"$/, ''),
                    values: values.map(val => val.replace(/^"/, '').replace(/"$/, '')),
                });
            } else {
                latest = {
                    name: fragment.replace(/^"/, '').replace(/"$/, ''),
                    attributes: [],
                };

                deserialized.push(latest);
            }
        }
        return deserialized;
    }

    /**
     * Splits a string based on passed in separator Similar to
     * functionality found in cvat backend base.js. Returns the
     * split string as an array
     *
     * @param string string that is to be split into an array
     * @param separator what the string should be split around
     * @return     string[]
     */
    static customSplit(string : string, separator): string[] {
      const regex = /"/gi;
      const occurences = [];
      let occurence = regex.exec(string);

      while (occurence) {
        occurences.push(occurence.index);
        occurence = regex.exec(string);
      }

      if (occurences.length % 2) {
        occurences.pop();
      }

      let copy = '';

      if (occurences.length) {
        let start = 0;

        for (let idx = 0; idx < occurences.length; idx += 2) {
            copy += string.substr(start, occurences[idx] - start);
            copy += string.substr(occurences[idx], occurences[idx + 1] - occurences[idx] + 1)
                .replace(new RegExp(separator, 'g'), '\0');
            start = occurences[idx + 1] + 1;
        }
        copy += string.substr(occurences[occurences.length - 1] + 1);
      } else {
        copy = string;
      }
      return copy.split(new RegExp(separator, 'g')).map(x => x.replace(/\0/g, separator))
    }

}
