import { TestContainers } from "./test-container-setup";

export default async function globalTeardown() {
  // eslint-disable-next-line
  const container = (global as any).__TEST_CONTAINERS__ as TestContainers;
  if (container) {
    await container.teardown();
  }
}
