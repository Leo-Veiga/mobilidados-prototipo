.libPaths(c("C:/Users/amara/code/mobilidados-indicadores/renv/library/windows/R-4.6/x86_64-w64-mingw32", .libPaths()))
suppressMessages({library(sf)})
sf_use_s2(FALSE)
args <- commandArgs(TRUE); pasta <- args[1]; saida <- args[2]
le <- function(padrao) {
  fs <- list.files(pasta, pattern = padrao, full.names = TRUE)
  do.call(rbind, lapply(fs, function(f) { x <- st_read(f, quiet = TRUE); x <- st_zm(x); 
    names(x)[tolower(names(x)) %in% c("situação","situacao","situa__o","situaã§ã£o")] <- "Situacao"
    x[, intersect(c("Modo","Cidade_n","Situacao","TMA","Ano"), names(x))] |> st_transform(5880) }))
}
cor <- le("Corredor.*[.]shp$"); est <- le("Estacoes.*[.]shp$")
cat("colunas:", names(cor), "\n"); print(table(trimws(cor$Situacao))); print(table(cor$TMA))
op <- function(x) x[trimws(x$Situacao) == "Operacional" & x$TMA %in% "Sim", ]
cor <- op(cor); est <- op(est)
mun <- geobr::read_municipality(year = 2022, showProgress = FALSE) |> st_transform(5880)
mun <- mun[lengths(st_intersects(mun, st_union(st_buffer(cor, 10)))) > 0, ]
inter <- suppressWarnings(st_intersection(cor, mun[, c("code_muni","name_muni","abbrev_state")]))
inter$km <- as.numeric(st_length(inter)) / 1000
km <- aggregate(km ~ code_muni + name_muni + abbrev_state, st_drop_geometry(inter), sum)
modos <- aggregate(Modo ~ code_muni, st_drop_geometry(inter), function(v) paste(sort(unique(v)), collapse = ", "))
sist <- aggregate(Cidade_n ~ code_muni, st_drop_geometry(inter), function(v) paste(sort(unique(v)), collapse = ", "))
ne <- st_join(est, mun[, "code_muni"]) |> st_drop_geometry()
ne <- as.data.frame(table(code_muni = ne$code_muni)); names(ne)[2] <- "estacoes"
r <- Reduce(function(a, b) merge(a, b, all.x = TRUE), list(km, modos, sist, ne))
r$estacoes[is.na(r$estacoes)] <- 0
r <- r[order(-r$km), ]
cat("municipios (qualquer contato):", nrow(r), "| com >=100 m:", sum(r$km >= 0.1), "| com >=1 km:", sum(r$km >= 1), "| com estação:", sum(r$estacoes > 0), "| km total:", round(sum(r$km)), "\n")
write.csv2(r, saida, row.names = FALSE, fileEncoding = "UTF-8")
