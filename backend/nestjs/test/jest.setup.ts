import { TestContainers } from "./test-container-setup";

export default async function globalSetup() {
  const container = TestContainers.getInstance();
  await container.setup();

  // eslint-disable-next-line
  (global as any).__TEST_CONTAINERS__ = container;
}
