type Paging = {
    size: number;
    total_page: number;
    current_page: number;
}

type Pageable<T> = {
    data: Array<T>;
    paging: Paging
}