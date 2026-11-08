/* eslint-disable @typescript-eslint/no-unused-expressions */
import { type TestLogger } from "@paperback/types";
import { expect } from "chai";

import { AsuraScans } from "../AsuraScans/main.js";
import sourceInfo from "../AsuraScans/pbconfig.js";
import { TestSuite, registerDefaultTests } from "./suite.js";

export async function runTests(logger: TestLogger) {
  const suite = new TestSuite("AsuraScans tests", logger);
  registerDefaultTests(suite, AsuraScans, sourceInfo);

  for (const section of await AsuraScans.getDiscoverSections()) {
    suite.test(`discover: ${section.id}`, async () => {
      const results = await AsuraScans.getDiscoverSectionItems(section, undefined);
      expect(results.items).not.be.empty;
    });
  }

  suite.test("discover: latest_updates paginates", async () => {
    const [, latest] = await AsuraScans.getDiscoverSections();
    const first = await AsuraScans.getDiscoverSectionItems(latest!, undefined);
    expect(first.metadata).to.deep.equal({ page: 2 });
    const second = await AsuraScans.getDiscoverSectionItems(latest!, { page: 2 });
    expect(second.items).not.be.empty;
  });

  suite.test("search: title + filters", async () => {
    const byTitle = await AsuraScans.getSearchResults({ title: "nano machine" }, undefined, {
      id: "latest",
      label: "",
    });
    expect(byTitle.items[0]?.mangaId).to.equal("nano-machine");

    const filtered = await AsuraScans.getSearchResults(
      { title: "", metadata: { genres: ["action"], status: ["completed"], minChapters: "100" } },
      undefined,
      { id: "popular", label: "" },
    );
    expect(filtered.items).not.be.empty;
  });

  await suite.run();
}
