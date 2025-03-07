 interface Book {
    id:number,
    name:string,
    description:string
}

export interface fetchBooksResponse {
    findAllBooks: Book[]
}