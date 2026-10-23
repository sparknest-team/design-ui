<template>
  <c-space direction="column" style="width: 100%">
    <c-card title="Project overview" description="Keep the team informed." />
    <c-card
      title="Project overview"
      subtitle="Updated today"
      description="Keep the team informed."
      top-divider
      bottom-divider
    >
      Release checklist and project updates.
      <template #title-action><c-button size="sm">More</c-button></template>
      <template #footer><c-button status="primary">View details</c-button></template>
    </c-card>
  </c-space>
</template>
