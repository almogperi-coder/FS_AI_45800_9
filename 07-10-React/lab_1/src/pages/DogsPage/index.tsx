import Avatar from "@mui/material/Avatar"
import Checkbox from "@mui/material/Checkbox"
import Chip from "@mui/material/Chip"
import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import ListItemText from "@mui/material/ListItemText"
import MenuItem from "@mui/material/MenuItem"
import OutlinedInput from "@mui/material/OutlinedInput"
import Paper from "@mui/material/Paper"
import Select, { type SelectChangeEvent } from "@mui/material/Select"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TablePagination from "@mui/material/TablePagination"
import TableRow from "@mui/material/TableRow"
import {
  DOG_COLUMN_IDS,
  DOG_COLUMN_LABELS,
  DOG_COLUMNS,
  type DogColumnId,
} from "./dog-columns"
import { useAppDispatch, useAppSelector } from "../../store/hooks"
import { loadDogs, setVisibleColumns } from "../../store/dogsReducer"
import type { DogBreed, DogMeasure } from "./dog-type"
import { DOGS_PAGE_SIZE } from "./dogs-api"
import "./dogs-page.css"

const headerCellSx = {
  fontWeight: 600,
  color: "primary.contrastText",
  bgcolor: "primary.main",
  whiteSpace: "nowrap" as const,
}

const columnsLabelId = "dogs-visible-columns-label"

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

function DogCell({ columnId, breed }: { columnId: DogColumnId; breed: DogBreed }) {
  const { name, description, life, male_weight, male_height, hypoallergenic, origin } =
    breed.attributes

  switch (columnId) {
    case "photo": {
      const photo = breedPhoto(breed)
      return (
        <TableCell>
          {photo ? (
            <img className="dogs-page__photo" src={photo} alt={name} />
          ) : (
            <Avatar variant="rounded" alt={name} sx={{ width: 72, height: 56 }}>
              {name.slice(0, 1)}
            </Avatar>
          )}
        </TableCell>
      )
    }
    case "name":
      return <TableCell sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>{name}</TableCell>
    case "origin":
      return <TableCell>{origin?.country || "—"}</TableCell>
    case "life":
      return <TableCell sx={{ whiteSpace: "nowrap" }}>{formatRange(life, "years")}</TableCell>
    case "maleWeight":
      return (
        <TableCell sx={{ whiteSpace: "nowrap" }}>{formatRange(male_weight, "kg")}</TableCell>
      )
    case "maleHeight":
      return (
        <TableCell sx={{ whiteSpace: "nowrap" }}>{formatRange(male_height, "cm")}</TableCell>
      )
    case "coat":
      return <TableCell sx={{ textTransform: "capitalize" }}>{formatCoat(breed)}</TableCell>
    case "hypoallergenic":
      return (
        <TableCell>
          <Chip
            size="small"
            label={hypoallergenic ? "Yes" : "No"}
            color={hypoallergenic ? "success" : "default"}
          />
        </TableCell>
      )
    case "description":
      return (
        <TableCell>
          <p className="dogs-page__description" title={description}>
            {description}
          </p>
        </TableCell>
      )
  }
}

function ColumnsSelect() {
  const dispatch = useAppDispatch()
  const visibleColumns = useAppSelector((state) => state.dogs.visibleColumns)

  const handleChange = (event: SelectChangeEvent<DogColumnId[]>) => {
    const { value } = event.target
    const next = typeof value === "string" ? value.split(",") : value
    dispatch(setVisibleColumns(next))
  }

  const summary =
    visibleColumns.length === DOG_COLUMN_IDS.length
      ? "All columns"
      : visibleColumns.map((id) => DOG_COLUMN_LABELS[id]).join(", ")

  return (
    <FormControl className="dogs-page__columns" size="small">
      <InputLabel id={columnsLabelId}>Columns</InputLabel>
      <Select
        labelId={columnsLabelId}
        id="dogs-visible-columns"
        multiple
        value={visibleColumns}
        onChange={handleChange}
        input={<OutlinedInput label="Columns" />}
        renderValue={() => summary}
      >
        {DOG_COLUMNS.map((column) => {
          const checked = visibleColumns.includes(column.id)
          const isLastSelected = checked && visibleColumns.length === 1

          return (
            <MenuItem key={column.id} value={column.id} disabled={isLastSelected}>
              <Checkbox checked={checked} disabled={isLastSelected} />
              <ListItemText primary={column.label} />
            </MenuItem>
          )
        })}
      </Select>
    </FormControl>
  )
}

export default function DogsPage() {
  const dispatch = useAppDispatch()
  const { breeds, status, page, totalRecords, visibleColumns } = useAppSelector(
    (state) => state.dogs,
  )
  const isPending = status === "idle" || status === "pending"
  const showTable = breeds.length > 0
  const columns = DOG_COLUMNS.filter((column) => visibleColumns.includes(column.id))

  return (
    <section className="dogs-page" aria-busy={isPending}>
      <header className="dogs-page__header">
        <div className="dogs-page__intro">
          <h1>Dogs</h1>
          <p className="dogs-page__subtitle">
            Dog breeds from the Dog API. Reports uses this same Redux list.
          </p>
        </div>
        <ColumnsSelect />
      </header>

      {showTable && (
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
          <TableContainer sx={{ maxHeight: "calc(100vh - 300px)" }}>
            <Table stickyHeader aria-label="Dog breeds" sx={{ minWidth: Math.max(columns.length * 140, 320) }}>
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell key={column.id} sx={headerCellSx}>
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {breeds.map((breed) => (
                  <TableRow key={breed.id} hover>
                    {columns.map((column) => (
                      <DogCell key={column.id} columnId={column.id} breed={breed} />
                    ))}
                  </TableRow>
                ))}
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
