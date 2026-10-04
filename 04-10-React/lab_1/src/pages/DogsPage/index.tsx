import Avatar from "@mui/material/Avatar"
import Chip from "@mui/material/Chip"
import LinearProgress from "@mui/material/LinearProgress"
import Paper from "@mui/material/Paper"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TablePagination from "@mui/material/TablePagination"
import TableRow from "@mui/material/TableRow"
import { useEffect } from "react"
import ErrorMessage from "../../components/ErrorMessage"
import Spinner from "../../components/Spinner"
import { useAppDispatch, useAppSelector } from "../../store/hooks"
import { clearDogsError, loadDogs } from "../../store/dogsReducer"
import type { DogBreed, DogMeasure } from "./dog-type"
import { DOGS_PAGE_SIZE } from "./dogs-api"
import "./dogs-page.css"

const headerCellSx = {
  fontWeight: 600,
  color: "primary.contrastText",
  bgcolor: "primary.main",
  whiteSpace: "nowrap" as const,
}

function formatRange(measure: DogMeasure | undefined, unit: string) {
  if (measure?.min == null || measure.max == null) {
    return "—"
  }

  if (measure.min === measure.max) {
    return `${measure.min} ${unit}`
  }

  return `${measure.min}–${measure.max} ${unit}`
}

function formatCoat(breed: DogBreed) {
  const { type, length } = breed.attributes.coat ?? {}
  const parts = [type, length].filter(Boolean)
  return parts.length > 0 ? parts.join(", ") : "—"
}

function breedPhoto(breed: DogBreed) {
  const image = breed.attributes.images?.[0]
  return image?.thumb || image?.medium || image?.url || ""
}

export default function DogsPage() {
  const dispatch = useAppDispatch()
  const { breeds, status, error, page, totalRecords } = useAppSelector((state) => state.dogs)
  const isPending = status === "idle" || status === "pending"
  const showTable = breeds.length > 0

  useEffect(() => {
    dispatch(loadDogs(1))
  }, [dispatch])

  return (
    <section className="dogs-page" aria-busy={isPending}>
      <header className="dogs-page__header">
        <h1>Dogs</h1>
        <p className="dogs-page__subtitle">
          Dog breeds from the Dog API, loaded with a Redux async thunk.
        </p>
      </header>

      <ErrorMessage
        title="Could not load dog breeds"
        message={status === "failed" ? error : ""}
        onDismiss={() => {
          dispatch(clearDogsError())
        }}
      />

      {isPending && !showTable && <Spinner message="Loading dog breeds…" />}

      {showTable && (
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
          {isPending && <LinearProgress />}
          <TableContainer sx={{ maxHeight: "calc(100vh - 300px)" }}>
            <Table stickyHeader aria-label="Dog breeds" sx={{ minWidth: 1080 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={headerCellSx}>Photo</TableCell>
                  <TableCell sx={headerCellSx}>Name</TableCell>
                  <TableCell sx={headerCellSx}>Origin</TableCell>
                  <TableCell sx={headerCellSx}>Life span</TableCell>
                  <TableCell sx={headerCellSx}>Male weight</TableCell>
                  <TableCell sx={headerCellSx}>Male height</TableCell>
                  <TableCell sx={headerCellSx}>Coat</TableCell>
                  <TableCell sx={headerCellSx}>Hypoallergenic</TableCell>
                  <TableCell sx={headerCellSx}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {breeds.map((breed) => {
                  const { name, description, life, male_weight, male_height, hypoallergenic, origin } =
                    breed.attributes
                  const photo = breedPhoto(breed)

                  return (
                  <TableRow key={breed.id} hover>
                    <TableCell>
                      {photo ? (
                        <img className="dogs-page__photo" src={photo} alt={name} />
                      ) : (
                        <Avatar variant="rounded" alt={name} sx={{ width: 72, height: 56 }}>
                          {name.slice(0, 1)}
                        </Avatar>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>{name}</TableCell>
                    <TableCell>{origin?.country || "—"}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>{formatRange(life, "years")}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>{formatRange(male_weight, "kg")}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>{formatRange(male_height, "cm")}</TableCell>
                    <TableCell sx={{ textTransform: "capitalize" }}>{formatCoat(breed)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={hypoallergenic ? "Yes" : "No"}
                        color={hypoallergenic ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell>
                      <p className="dogs-page__description" title={description}>
                        {description}
                      </p>
                    </TableCell>
                  </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalRecords}
            page={Math.max(page - 1, 0)}
            onPageChange={(_event, nextPage) => {
              dispatch(loadDogs(nextPage + 1))
            }}
            rowsPerPage={DOGS_PAGE_SIZE}
            rowsPerPageOptions={[DOGS_PAGE_SIZE]}
            labelRowsPerPage="Breeds per page"
          />
        </Paper>
      )}

      {status === "failed" && !showTable && (
        <p className="dogs-page__empty">No dog breeds loaded. Try again.</p>
      )}
    </section>
  )
}
