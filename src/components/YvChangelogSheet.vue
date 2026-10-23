<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { parseChangelog } from '@/lib/changelog/parse';
import changelogRaw from '../../CHANGELOG.md?raw';

const isOpen = defineModel<boolean>('open', { default: false });

const VISIBLE_BY_DEFAULT = 3;

const releases = computed(() => parseChangelog(changelogRaw));
const showAll = ref(false);
const visibleReleases = computed(() =>
  showAll.value ? releases.value : releases.value.slice(0, VISIBLE_BY_DEFAULT),
);
const hiddenCount = computed(() => Math.max(0, releases.value.length - VISIBLE_BY_DEFAULT));

watch(isOpen, (open) => {
  if (!open) {
    showAll.value = false;
  }
});
</script>

<template>
  <Sheet v-model:open="isOpen">
    <SheetContent
      side="right"
      class="w-full !max-w-md"
    >
      <SheetHeader class="border-b border-border pr-12">
        <SheetTitle>Changelog</SheetTitle>
        <SheetDescription>What changed in each release of yehyecoa-vue.</SheetDescription>
      </SheetHeader>

      <ScrollArea class="min-h-0 flex-1">
        <div class="flex flex-col gap-6 px-4 py-4 pb-8">
          <section
            v-for="release of visibleReleases"
            :key="release.version"
          >
            <header class="flex items-center gap-2">
              <h3 class="text-base font-bold text-foreground">
                v{{ release.version }}
              </h3>
              <span
                v-if="release === releases[0]"
                class="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
              >
                latest
              </span>
              <time
                v-if="release.date"
                class="ml-auto text-xs text-muted-foreground"
              >{{ release.date }}</time>
              <a
                v-if="release.compareUrl"
                :href="release.compareUrl"
                target="_blank"
                rel="noopener"
                title="See all changes"
                class="flex items-center text-muted-foreground transition-colors hover:text-foreground"
              >
                <span
                  aria-hidden="true"
                  class="i-mynaui:arrow-up-right text-sm"
                />
              </a>
            </header>

            <div
              v-for="section of release.sections"
              :key="section.heading"
              class="mt-3"
            >
              <h4 class="mb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                {{ section.heading }}
              </h4>
              <ul class="flex flex-col gap-1.5">
                <li
                  v-for="(item, index) of section.items"
                  :key="`${release.version}-${section.heading}-${index}`"
                  class="flex items-baseline gap-1.5 text-sm leading-snug"
                >
                  <span
                    aria-hidden="true"
                    class="flex-none text-muted-foreground"
                  >•</span>
                  <span>
                    <strong
                      v-if="item.scope"
                      class="font-medium text-foreground"
                    >{{ item.scope }}: </strong>
                    <span class="whitespace-pre-wrap">{{ item.text }}</span>
                    <a
                      v-for="commit of item.commits"
                      :key="commit.short"
                      :href="commit.url"
                      target="_blank"
                      rel="noopener"
                      class="ml-2 font-mono text-xs text-muted-foreground hover:text-foreground hover:underline"
                    >{{ commit.short }}</a>
                  </span>
                </li>
              </ul>
            </div>
          </section>

          <Button
            v-if="hiddenCount > 0"
            type="button"
            variant="outline"
            size="sm"
            class="self-start"
            @click="showAll = !showAll"
          >
            {{ showAll ? 'Show less' : `Show ${hiddenCount} earlier release${hiddenCount === 1 ? '' : 's'}` }}
          </Button>
        </div>
      </ScrollArea>
    </SheetContent>
  </Sheet>
</template>
