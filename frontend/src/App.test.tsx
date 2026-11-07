import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, expect, test } from "vitest"
import { App } from "./App"

const FEED_SIZE = 5
// R1043 has four updates, R1066 two and R1055 one; each risk also has its "New risk" post.
const REGION_UPDATES = 7
const REGION_RISKS = 3

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
const newsPage = () => screen.getByLabelText("Radar", { selector: ".page" })

test("an invited expert sees why it pays off, enters any code, picks how to appear, and lands on the feed", async () => {
  const user = userEvent.setup()
  render(<App />)

  expect(screen.getByText("Your view sharpens the picture")).toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: /get started/i }))
  expect(screen.getByRole("button", { name: /continue/i })).toBeDisabled()
  await user.type(screen.getByLabelText("Invite code"), "anything")
  await user.click(screen.getByRole("button", { name: /continue/i }))
  await user.click(screen.getByRole("button", { name: /anonymous/i }))
  await user.click(screen.getByRole("button", { name: /^start/i }))

  expect(
    within(feedPage()).getByText(
      `${FEED_SIZE} questions this week · about two minutes`,
    ),
  ).toBeInTheDocument()
  expect(
    screen.getByRole("button", { name: "How you appear: Anonymous" }),
  ).toBeInTheDocument()
})

test("changing how you appear takes a choice and a confirm, never a single tap", async () => {
  const user = await jumpTo(/regular expert/i)
  const toggle = () => screen.getByRole("button", { name: /How you appear/ })
  expect(toggle()).toHaveAccessibleName("How you appear: Known to ACAPS")

  await user.click(toggle())
  const card = screen.getByRole("dialog", { name: "How you appear" })
  await user.click(within(card).getByRole("button", { name: /^Anonymous/ }))
  // Picking alone changes nothing; only the confirm button applies it.
  expect(toggle()).toHaveAccessibleName("How you appear: Known to ACAPS")
  await user.click(
    within(card).getByRole("button", { name: "Switch to Anonymous" }),
  )

  expect(toggle()).toHaveAccessibleName("How you appear: Anonymous")
  expect(
    screen.queryByRole("dialog", { name: "How you appear" }),
  ).not.toBeInTheDocument()
})

test("answering a trigger card shows the panel, then the card leaves the feed for the You page", async () => {
  const user = await jumpTo(/first week/i)
  await user.click(
    within(feedPage()).getByText(/attacks along the Chad–Sudan border/),
  )

  const sheet = screen.getByRole("dialog")
  await user.click(within(sheet).getByRole("button", { name: "Further along" }))
  await user.click(
    await within(sheet).findByRole("button", { name: "Send without a note" }),
  )

  expect(await within(sheet).findByText("Panel responses")).toBeInTheDocument()
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
      /Visible to ACAPS only/,
    ),
  ).toBeInTheDocument()
})

test("Radar stays locked for a lapsed expert until they answer one card", async () => {
  const user = await jumpTo(/lapsed/i)
  expect(within(newsPage()).getByText("Update locked")).toBeInTheDocument()

  await user.click(
    within(feedPage()).getByText(/attacks along the Chad–Sudan border/),
  )
  const sheet = screen.getByRole("dialog")
  await user.click(within(sheet).getByRole("button", { name: "About right" }))
  await user.click(
    await within(sheet).findByRole("button", { name: "Send without a note" }),
  )

  expect(
    within(newsPage()).queryByText("Update locked"),
  ).not.toBeInTheDocument()
})

test("a caught-up expert sees an empty feed, their impact, and their standing", async () => {
  await jumpTo(/all caught up/i)
  expect(within(feedPage()).getByText("No open questions")).toBeInTheDocument()
  const you = screen.getByLabelText("You", { selector: ".page" })
  expect(within(you).getByText("Every round answered")).toBeInTheDocument()
  expect(within(you).getByText(/kept this trigger at 10%/)).toBeInTheDocument()
})

test("Radar is ACAPS's own posts for the region, and a post opens with the risk it belongs to", async () => {
  const user = await jumpTo(/regular expert/i)
  const news = newsPage()
  expect(
    within(news).getByText(/3 risks in and around eastern Chad/),
  ).toBeInTheDocument()
  expect(within(news).getAllByText("Update")).toHaveLength(REGION_UPDATES)
  expect(within(news).getAllByText("New risk")).toHaveLength(REGION_RISKS)
  expect(within(news).queryByText(/E1 settlement plan/)).not.toBeInTheDocument()

  await user.click(
    within(news).getByText(/^The risk remains active, although no significant/),
  )
  const sheet = screen.getByRole("dialog", {
    name: /^The risk remains active, although no significant/,
  })
  expect(within(sheet).getByText("30 September 2026")).toBeInTheDocument()
  expect(within(sheet).getByText("55,000+")).toBeInTheDocument()
  expect(within(sheet).getByText("40% completed")).toBeInTheDocument()
})
