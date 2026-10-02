import React from "react";
import { useClient } from "sanity";
import { Box, Button, Card, Flex, Text } from "@sanity/ui";
import { articleOpening, articleReading } from "../../lib/presentation.mjs";
export default function ArticlePreview({ document }) {
  const client = useClient({ apiVersion: "2026-09-01" });
  const doc = document.displayed || {};
  const origin = window.location.origin;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="${origin}/"><link rel="stylesheet" href="/assets/css/site.css"><link rel="stylesheet" href="/assets/css/journal.css"><link rel="stylesheet" href="/assets/css/journal-cms.css"></head><body class="page page--journal page--article"><main><article class="journal-article"><header class="journal-article__header section-shell"><div class="journal-article__opening">${articleOpening(doc, client.config())}</div></header><div class="journal-article__reading section-shell">${articleReading(doc, client.config())}</div></article></main></body></html>`;
  return (
    <Flex direction="column" height="fill">
      <Card padding={3} borderBottom>
        <Flex gap={3} align="center" justify="space-between">
          <Box>
            <Text size={1}>
              Draft preview · only your team can see these changes
            </Text>
          </Box>
          {doc.slug?.current && document.published && (
            <Button
              as="a"
              href={`/journal/${encodeURIComponent(document.published.slug.current)}/`}
              target="_blank"
              rel="noopener noreferrer"
              text="Open published article"
              mode="ghost"
            />
          )}
        </Flex>
      </Card>
      <iframe
        title="Article preview"
        sandbox="allow-same-origin"
        srcDoc={html}
        style={{
          border: 0,
          width: "100%",
          flex: 1,
          minHeight: 500,
          background: "#f7f8f2",
        }}
      />
    </Flex>
  );
}
