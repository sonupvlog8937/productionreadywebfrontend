import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard/ProductCard";
import FilterSection from "./FilterSection";
import {
  Box,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  type SelectChangeEvent,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { useParams, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { getAllProducts } from "../../../Redux Toolkit/Customer/ProductSlice";

const Products: React.FC = () => {
  const [sort, setSort] = useState<string>("");
  const [showFilter, setShowFilter] = useState(false);
  const [page, setPage] = useState(1);

  const theme = useTheme();
  const isLarge = useMediaQuery(theme.breakpoints.up("lg"));

  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchParams] = useSearchParams();

  const dispatch = useAppDispatch();
  const { products } = useAppSelector((store) => store);

  const handleSortProduct = (event: SelectChangeEvent) => {
    setSort(event.target.value);
  };

  const handleShowFilter = () => {
    setShowFilter((prev) => !prev);
  };

  const handlePageChange = (
    _: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  useEffect(() => {
    if (!categoryId) return;

    const priceRange = searchParams.get("price");
    const [minPrice, maxPrice] = priceRange
      ? priceRange.split("-")
      : [];

    const filters = {
      brand: searchParams.get("brand") || "",
      color: searchParams.get("color") || "",
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minDiscount: searchParams.get("discount")
        ? Number(searchParams.get("discount"))
        : undefined,
      pageNumber: page - 1,
    };

    dispatch(
      getAllProducts({
        category: categoryId,
        sort,
        ...filters,
      })
    );
  }, [categoryId, searchParams, sort, page, dispatch]);

  return (
    <div className="-z-10 mt-10">
      {/* Heading */}
      <h1 className="text-3xl text-center font-bold text-gray-700 pb-5 px-9 uppercase">
        {categoryId?.split("_").map((item, index) => (
          <span key={index} className="mr-2">
            {item}
          </span>
        ))}
      </h1>

      <div className="lg:flex">
        {/* Filter */}
        <section className="hidden lg:block w-[20%]">
          <FilterSection />
        </section>

        {/* Product Section */}
        <div className="w-full lg:w-[80%] space-y-5">
          <div className="flex justify-between items-center px-9 h-[40px]">
            <div className="relative w-[50%]">
              {!isLarge && (
                <IconButton onClick={handleShowFilter}>
                  <FilterAltIcon />
                </IconButton>
              )}

              {showFilter && !isLarge && (
                <Box sx={{ zIndex: 10 }} className="absolute top-[60px]">
                  <FilterSection />
                </Box>
              )}
            </div>

            <FormControl size="small" sx={{ width: 200 }}>
              <InputLabel id="sort">Sort</InputLabel>
              <Select
                labelId="sort"
                value={sort}
                label="Sort"
                onChange={handleSortProduct}
              >
                <MenuItem value="price_low">
                  Price : Low - High
                </MenuItem>
                <MenuItem value="price_high">
                  Price : High - Low
                </MenuItem>
              </Select>
            </FormControl>
          </div>

          <Divider />

          {/* Products */}
          {products.products?.length ? (
            <section className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-5 px-5">
              {products.products.map((item) => (
                <ProductCard
                  key={item._id}
                  item={item}
                  categoryId={categoryId!}
                />
              ))}
            </section>
          ) : (
            <section className="flex flex-col items-center justify-center h-[67vh] gap-5">
              <img
                className="w-80"
                src="https://cdn.pixabay.com/photo/2022/05/28/10/45/oops-7227010_960_720.png"
                alt="Not Found"
              />
              <h1 className="font-bold text-xl text-center">
                Product Not Found For{" "}
                <span className="text-primary-color uppercase ml-2">
                  {categoryId?.replaceAll("_", " ")}
                </span>
              </h1>
            </section>
          )}

          {/* Pagination */}
          {products.totalPages && products.totalPages > 1 && (
            <div className="flex justify-center pt-10">
              <Pagination
                page={page}
                count={products.totalPages}
                onChange={handlePageChange}
                color="primary"
                shape="rounded"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
