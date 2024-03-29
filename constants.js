export const GL_CODE = `GL_Code`;
export const SUB_GL_CODE = `Sub_GL_Code`;

export const CHART_OF_ACCOUNT_COLUMNS = {
  "Segment ID": "segmentId",
  Description: "description",
  Category: "category",
  "Typical Balance": "typicalBalance",
};

export const VALID_COLUMN_NAMES = Object.keys(CHART_OF_ACCOUNT_COLUMNS);

export const CURRENCY_FORMAT = "$#,##0.00;[Red]-$#,##0.00";

export const BLUE = "#3597fe";
export const RED = "#f54747";

export const barLoaderCSS = `
margin-top: 2em;
`;

export const customSelectStyles = {
  valueContainer: (provided, state) => ({
    ...provided,
    fontSize: 12,
  }),
  menuList: (provided, state) => ({
    ...provided,
    fontSize: 12,
  }),
};
