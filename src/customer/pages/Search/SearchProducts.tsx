import { useState, type ChangeEvent, type KeyboardEvent } from "react";
import { searchProduct } from "../../../Redux Toolkit/Customer/ProductSlice";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import ProductCard from "../Products/ProductCard/ProductCard";

const SearchProducts: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useAppDispatch();
  const { products } = useAppSelector((store) => store);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleProductSearch = () => {
    if (!searchQuery.trim()) return;
    dispatch(searchProduct(searchQuery.trim()));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleProductSearch();
    }
  };

  return (
    <div className="min-h-screen px-5 lg:px-20">
      {/* Search Box */}
      <div className="flex justify-center py-5">
        <input
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          className="border-none outline-none bg-slate-100 px-10 py-3 w-full lg:w-1/2"
          type="text"
          placeholder="Search Product..."
        />
      </div>

      {/* Results */}
      <section>
        {products.searchProduct?.length ? (
          <section className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-5 px-5">
            {products.searchProduct.map((item: any) => (
              <ProductCard
                key={item._id}
                item={item}
                categoryId={item.category?._id || "search"}
              />
            ))}
          </section>
        ) : searchQuery ? (
          <section className="flex flex-col items-center justify-center h-[67vh] gap-5">
            <img
              className="w-80"
              src="https://cdn.pixabay.com/photo/2022/05/28/10/45/oops-7227010_960_720.png"
              alt="Not Found"
            />
            <h1 className="font-bold text-xl text-center">
              Product Not Found For{" "}
              <span className="text-primary-color uppercase ml-2">
                {searchQuery}
              </span>
            </h1>
          </section>
        ) : (
          <div className="h-[70vh] flex flex-col justify-center items-center">
            <h1 className="font-bold text-5xl text-center">
              Search Product Here
            </h1>
          </div>
        )}
      </section>
    </div>
  );
};

export default SearchProducts;
