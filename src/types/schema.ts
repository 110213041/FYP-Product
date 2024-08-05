type _Cell_Base = { id: string }

export type Cell_Text = {
    cell_type: "text";
    source: Array<string>;
} & _Cell_Base;

export type Cell_Markdown = {
    cell_type: "markdown",
    metadata: {},
    source: Array<string>
} & _Cell_Base;

export type Cell_Prompt = {
    cell_type: "prompt"
    metadata: {},
    source: Array<string>,
    response: Array<string>
} & _Cell_Base;

export type Cell = Cell_Text | Cell_Markdown | Cell_Prompt;

/** @property {UUID} id*/
export type Note = {
    id: string
    name: string;
    lastModified: number;
    cells: Array<Cell>;
}

