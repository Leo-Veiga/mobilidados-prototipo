.libPaths(c("C:/Users/amara/code/mobilidados-indicadores/renv/library/windows/R-4.6/x86_64-w64-mingw32", .libPaths()))
suppressMessages(library(sf))
e <- geobr::read_state(year = 2020, showProgress = FALSE)
e <- st_transform(e, 5880)
e <- st_simplify(e, dTolerance = 6000, preserveTopology = TRUE)
e <- st_transform(e, 4326)
e <- e[, c("abbrev_state", "name_state", "name_region")]
st_write(e, commandArgs(TRUE)[1], delete_dsn = TRUE, quiet = TRUE)
cat(nrow(e), "estados\n")
