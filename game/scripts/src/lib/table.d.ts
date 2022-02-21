/** @noSelfInFile */
declare namespace table {
    function count(t: Object): number;
    function contains(t: Object, v: any): boolean;
    function random_and_remove<T>(t: T[]): T;
    function remove_value(t: Object, v: any): void;
    function has_element_fit(t: Object, func: (t: Object, k: any, v: any) => boolean): [any, any];
    function get_key_by_value(t: Object, v: any): any;
    function shallowcopy<T>(orig: T[]): T[];
    function deepcopy(orig: Object): Object;
    function random<T>(t: T[]): T;
    function shuffle<T>(tbl: T[]): T[];
    function random_some<T>(t: T[], count: number): T[];
    function random_with_condition<T>(t: T[], func: (t: Object, k: any, v: T) => boolean): T;
    function filter<T>(t: Object, condition: (t: Object, k: any, v: T) => boolean): T[];
    function foreach(t: Object, calback: (k: any, v: any) => void): void;
    function make_key_Object(t: Object): Object;
    function is_equal(t1: Object, t2: Object): boolean;
    function random_key(t: Object): any;
    function print(t: Object): void;
    function deep_print(t: Object): void;
    function safe_Object(t: Object): Object;
    function save_as_kv_file(tbl: Object, filePath: string, headerName: string, utf16: boolean): void;
    function to_kv_lines(tbl: Object, tabCount: number): void;
    function join(...t: Object[]): Object;
    function reverse(tbl: Object): Object;
    function swap_key_value(tbl: Object): Object;
    function number_Object(t: Object): Object;
    function string_Object(t: Object): Object;
    function random_allocate(t: Object, l: Object, soft?: boolean): Object;
    function random_weight_Object(t: Object): any;
}
