import { useState } from "react"
import AdditionalInfo from "../AdditionalInfo"
import "./user-card.css"
import type { SingleUserType } from "../../pages/UsersPage/user-type"
import { Chip } from "@mui/material"
import { useAppContext } from "../../context/AppContext"
import { format } from "date-fns"
import { useAppSelector } from "../../store/hooks"

type UserCardProps = {
  user: SingleUserType
  onRemove: () => void
  onSelect?: () => void
  removeLabel?: string
}

export default function UserCard(props: UserCardProps) {
  const { user, onRemove, onSelect, removeLabel = "Remove User" } = props
  const { name, gender, picture, email, location } = user
  const fullName = `${name.title} ${name.first} ${name.last}`
  const [showDetails, setShowDetails] = useState(false)
  const { settings } = useAppContext()
  const { isLocalTime } = settings
  const isFavorite = useAppSelector((state) =>
    state.favorites.users.some((favorite) => favorite.login.uuid === user.login.uuid),
  )

  const timeStamp = format(
    isLocalTime ? new Date(user.registered.date).toLocaleString() : user.registered.date,
    "dd/MMM/yyyy HH:mm",
  )

  const selectLabel = isFavorite
    ? `${fullName} is saved in favorites`
    : `Save ${fullName} to favorites`

  const identity = (
    <>
      <img
        className="user-card__image"
        src={picture.large}
        alt=""
        width={120}
        height={120}
      />
      <span className="user-card__gender">{gender}</span>
      <span className="user-card__name">{fullName}</span>
      <span className="user-card__email">{email}</span>
      <span className="user-card__location">
        {location.city}, {location.country}
      </span>
    </>
  )

  return (
    <article className={isFavorite ? "user-card user-card--favorite" : "user-card"}>
      {onSelect ? (
        <button
          type="button"
          className="user-card__select"
          aria-pressed={isFavorite}
          aria-label={selectLabel}
          onClick={onSelect}
        >
          {identity}
        </button>
      ) : (
        <div className="user-card__identity">{identity}</div>
      )}
      <div className="user-card__meta">
        <Chip label={timeStamp} color="primary" />
        {isFavorite && <Chip label="Favorite" color="secondary" size="small" />}
      </div>
      <button
        type="button"
        className="user-card__details-toggle"
        aria-expanded={showDetails}
        onClick={() => {
          setShowDetails((current) => !current)
        }}
      >
        {showDetails ? "Hide info" : "More info"}
      </button>
      {showDetails && <AdditionalInfo user={user} />}
      <button type="button" className="user-card__remove" onClick={onRemove}>
        {removeLabel}
      </button>
    </article>
  )
}
