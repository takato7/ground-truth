import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, expect, test } from "vitest"
import { App } from "./App"

const FEED_SIZE = 5

beforeEach(() => {
  localStorage.clear()
})

async function jumpTo(label: RegExp) {
  const user = userEvent.setup()
  render(<App />)
  const select = screen.getByRole("combobox", { name: "Demo scenario" })
  const option = within(select).getByRole<HTMLOptionElement>("option", {
    name: label,
  })
  await user.selectOptions(select, option)
  return user
}

const feedPage = () => screen.getByLabelText("Feed", { selector: ".page" })
const newsPage = () => screen.getByLabelText("News", { selector: ".page" })

test("an invited expert redeems a code, picks how to appear, and lands on the feed", async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.type(screen.getByLabelText("Invite code"), "nope")
  await user.click(screen.getByRole("button", { name: /continue/i }))
  expect(screen.getByText(/isn’t valid/)).toBeInTheDocument()

  await user.clear(screen.getByLabelText("Invite code"))
  await user.type(screen.getByLabelText("Invite code"), "CHAD-E1")
  await user.click(screen.getByRole("button", { name: /continue/i }))
  await user.click(screen.getByRole("button", { name: /anonymous/i }))
  await user.click(screen.getByRole("button", { name: /^start/i }))

  expect(
    within(feedPage()).getByText(
      `${FEED_SIZE} questions this week · about two minutes`,
    ),
  ).toBeInTheDocument()
  expect(within(feedPage()).getByText("Anonymous")).toBeInTheDocument()
})

test("answering a trigger card shows the panel, then the card leaves the feed for the You page", async () => {
  const user = await jumpTo(/first week/i)
  await user.click(
    within(feedPage()).getByText(/attacks along the Chad–Sudan border/),
  )

  const sheet = screen.getByRole("dialog")
  await user.click(
    within(sheet).getByRole("button", { name: "It’s further along" }),
  )
  await user.click(
    await within(sheet).findByRole("button", { name: "Skip and send" }),
  )

  expect(
    await within(sheet).findByText("Here’s where the panel stands"),
  ).toBeInTheDocument()
  expect(
    within(sheet).getByText(`${FEED_SIZE + 1} experts answered`),
  ).toBeInTheDocument()
  // Named peers are quoted; anonymous ones are only counted.
  expect(within(sheet).getByText("Tomas Hevel")).toBeInTheDocument()
  expect(
    within(sheet).getByText(/2 anonymous answers counted/),
  ).toBeInTheDocument()

  await user.click(within(sheet).getByRole("button", { name: "Done" }))
  expect(
    await within(feedPage()).findByText(/4 questions this week/),
  ).toBeInTheDocument()
  const you = screen.getByLabelText("You", { selector: ".page" })
  expect(
    within(you).getByText(/attacks along the Chad–Sudan border/),
  ).toBeInTheDocument()
})

test("an anonymous expert is told their note goes to ACAPS only", async () => {
  const user = await jumpTo(/anonymous expert/i)
  await user.click(
    within(feedPage()).getByText(/anything happening in eastern Chad/),
  )
  expect(
    within(screen.getByRole("dialog")).getByPlaceholderText(
      /Only ACAPS sees this/,
    ),
  ).toBeInTheDocument()
})

test("News stays locked for a lapsed expert until they answer one card", async () => {
  const user = await jumpTo(/lapsed/i)
  expect(
    within(newsPage()).getByText("This week’s update is waiting"),
  ).toBeInTheDocument()

  await user.click(
    within(feedPage()).getByText(/attacks along the Chad–Sudan border/),
  )
  const sheet = screen.getByRole("dialog")
  await user.click(
    within(sheet).getByRole("button", { name: "That’s about right" }),
  )
  await user.click(
    await within(sheet).findByRole("button", { name: "Skip and send" }),
  )

  expect(
    within(newsPage()).queryByText("This week’s update is waiting"),
  ).not.toBeInTheDocument()
})

test("a caught-up expert sees an empty feed, their impact, and their standing", async () => {
  await jumpTo(/all caught up/i)
  expect(
    within(feedPage()).getByText("You’re all caught up"),
  ).toBeInTheDocument()
  const you = screen.getByLabelText("You", { selector: ".page" })
  expect(
    within(you).getByText("Your estimates carry weight"),
  ).toBeInTheDocument()
  expect(
    within(you).getByText(/lowered this from 20% to 10%/),
  ).toBeInTheDocument()
})
