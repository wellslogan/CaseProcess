import * as Papa from 'papaparse';
import * as JSZip from 'jszip';

import {
  xmlColumnValuesToObjectPropsMap,
  objectPropsToCsvColumnMap,
  TARGET_XML_PATH,
} from './constants';

/**
 * Parse XML content for table rows
 * @param {String} xmlString the xml string to parse
 * @returns {NodeList} list of table row nodes
 */
const parseXml = (xmlString: string): Document => {
  const parser = new DOMParser();

  return parser.parseFromString(xmlString, 'text/xml');
};

/**
 * Process tableColumns to an array of text content
 * e.g. | hello | world | how are you |
 *      becomes ['hello', 'world', 'how are you']
 * @param {Element[]} tcElement
 * @returns {string[]} the text content
 */
const tableColumnsToTextArray = (tcElements: Element[]): string[] => {
  // given the following xml structure for a single column:
  //  <w:tc>
  //    <w:p>
  //      <w:r>
  //        <w:t>Some te</w:t>
  //      </w:r>
  //      <w:r>
  //        <w:t>xt might be split like this</w:t>
  //      </w:r>
  //    </w:p>
  //    <w:p>
  //      <w:r>
  //        <w:t>could be multiple P's too. Separate them with a comma</w:t>
  //      </w:r>
  //    </w:p>
  //  </w:tc>
  // Combine the nested and possibly 'split' text
  // so the column would have text value 'Some text might be split like this'
  // Also, separate muliple Paragraphs with a comma

  return tcElements.map(column => {
    const paragraphs = Array.from(column.querySelectorAll('p'));
    return paragraphs
      .map(paragraph =>
        Array.from(paragraph.querySelectorAll('r > t'))
          .map(node => node.textContent)
          .join('')
      )
      .filter(texts => !!texts)
      .join(' | ');
  });
};

/**
 * Process the given table element's rows
 * for case (SearchResult) information
 * @param {Element} tableElement the table element
 * @returns {Object} the case information
 */
const processInnerTableRows = (tableElement: Element): Case => {
  const tableRows = tableElement.querySelectorAll(':scope > tr');
  const caseInfo = {} as Case;
  tableRows.forEach(tableRow => {
    const columns = Array.from(tableRow.querySelectorAll(':scope > tc'));
    const textByColumn = tableColumnsToTextArray(columns);
    // compare the first element of this array
    // against the 'sections' map
    const prop = xmlColumnValuesToObjectPropsMap[textByColumn[0]];
    if (prop !== undefined) {
      [, caseInfo[prop]] = textByColumn;
    }
  });
  return caseInfo;
};

/**
 * Process an XML document into an array of cases
 * @param {Document} xmlDoc the root xml document
 * @returns {Object[]} an array of cases
 */
const processXmlDocument = (xmlDoc: Document): Case[] => {
  const rootTables = Array.from(xmlDoc.querySelectorAll('body > tbl'));
  // each root table is a Case
  return rootTables.map(tableEl => {
    // Every table has a single TR, which contains an inner TBL
    // that contains the ACTUAL TRs for the search result

    // In short, the structure is the following:
    //    <w:tbl>
    //      <w:tr></w:tr> <!-- GOTCHA TR, need to ignore -->
    //      <w:tr>
    //        <w:tc>
    //          <w:tbl>
    //            <w:tr> Actual </w:tr>
    //            <w:tr>  case  </w:tr>
    //            <w:tr>  rows  </w:tr>
    //          </w:tbl>
    //        </w:tc>
    //      </w:tr>
    //    </w:tbl>

    // queries the table for an inner table
    const firstInnerTbl = tableEl.querySelector('tr > tc > tbl');

    return processInnerTableRows(firstInnerTbl);
  });
};

/**
 * Get prop of given object by accessor function
 * or prop name
 * @param {Object} object
 * @param {string | Function} accessor
 */
const getByPropOrFunc = (
  object: object,
  accessor: string | ((item: object) => any)
): any => {
  return typeof accessor === 'string' ? object[accessor] : accessor(object);
};

/**
 * transform a row object into an array
 * of values based on the column definitions
 * @param {Object} singleCase the case to transform
 * @return {string[]} the array of values
 */
const transformCaseToArray = (singleCase: Case): string[] => {
  return objectPropsToCsvColumnMap
    .map(col => getByPropOrFunc(singleCase, col.accessor))
    .map(data => data || '')
    .map(data => data.replace(/[\r\n]/gm, ' ').replace(/ {2,}/gm, ' '));
};

/**
 * Converts cases to CSV content
 * @param cases the array of cases
 * @returns the CSV content
 */
const casesToCsvString = (cases: Case[]): string => {
  const casesForCsv = cases.map(c => transformCaseToArray(c));
  // const stringifiedCsv = await csvStringifyAsync(casesForCsv, {
  //   header: true,
  //   columns: objectPropsToCsvColumnMap.map(col => col.name),
  // });
  const stringifiedCsv = Papa.unparse({
    fields: objectPropsToCsvColumnMap.map(_ => _.name),
    data: casesForCsv,
  });
  return stringifiedCsv;
};

/**
 * Unzip the docx and extract the document.xml, as text
 * @param file the file to extract
 * @returns a promise with the document text
 */
const loadDocumentXMLAsync = async (file: File): Promise<string> => {
  const zip = await JSZip.loadAsync(file);
  const documentXmlContents = await zip.file(TARGET_XML_PATH).async('text');
  return documentXmlContents;
};

/**
 * Process one or multiple DOCX files and return a CSV blob
 * @param files the DOCX file(s) to process
 * @returns a CSV file blob
 */
const processDocxAsync = async (files: File[]): Promise<Blob> => {
  let finalCases = [];
  for (let file of files) {
    const fileContents = await loadDocumentXMLAsync(file);
    const parsedFileContents = parseXml(fileContents);
    const parsedCases = processXmlDocument(parsedFileContents);
    finalCases = [...finalCases, ...parsedCases];
  }

  const stringifiedCsv = casesToCsvString(finalCases);
  return new Blob([stringifiedCsv], { type: 'text/csv;charset=utf-8' });
};

export default processDocxAsync;
