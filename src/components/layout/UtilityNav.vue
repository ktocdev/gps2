<template>
  <nav class="utility-nav">
    <button @click="clearAllStorage" class="utility-nav__button utility-nav__button--danger">
      ✨ Clear All Storage
    </button>
  </nav>
</template>

<script setup lang="ts">
const clearAllStorage = () => {
  if (confirm('⚠️ This will clear ALL storage (localStorage + sessionStorage) and reload the page. Continue?')) {
    // Clear localStorage
    localStorage.clear()
    // Clear sessionStorage
    sessionStorage.clear()
    // Reload the page to reinitialize everything
    window.location.reload()
  }
}
</script>

<style scoped>
.utility-nav {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.utility-nav__button {
  padding-block: var(--space-2);
  padding-inline: var(--space-3);
  background-color: var(--color-neutral-200);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.utility-nav__button:hover {
  background-color: var(--color-neutral-300);
  border-color: var(--color-border-dark);
}

.utility-nav__button--danger {
  background-color: var(--color-error);
  color: var(--color-text-inverse);
  border-color: var(--color-error);
}

.utility-nav__button--danger:hover {
  background-color: #dc2626;
  border-color: #dc2626;
}

.utility-nav__button--danger:active {
  background-color: #b91c1c;
  border-color: #b91c1c;
}
</style>
