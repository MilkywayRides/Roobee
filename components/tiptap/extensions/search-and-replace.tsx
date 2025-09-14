import { type Editor as CoreEditor, Extension, type Range } from "@tiptap/core";
import type { Node as PMNode } from "@tiptap/pm/model";
import { Plugin, PluginKey, type EditorState, type Transaction } from "@tiptap/pm/state";
import { Decoration, DecorationSet, type EditorView } from "@tiptap/pm/view";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    search: {
      /**
       * @description Set search term in extension.
       */
      setSearchTerm: (searchTerm: string) => ReturnType;
      /**
       * @description Set replace term in extension.
       */
      setReplaceTerm: (replaceTerm: string) => ReturnType;
      /**
       * @description Replace first instance of search result with given replace term.
       */
      replace: () => ReturnType;
      /**
       * @description Replace all instances of search result with given replace term.
       */
      replaceAll: () => ReturnType;
      /**
       * @description Select the next search result.
       */
      selectNextResult: () => ReturnType;
      /**
       * @description Select the previous search result.
       */
      selectPreviousResult: () => ReturnType;
      /**
       * @description Set case sensitivity in extension.
       */
      setCaseSensitive: (caseSensitive: boolean) => ReturnType;
    };
  }

  interface Storage {
    searchAndReplace: SearchAndReplaceStorage;
  }
}

interface TextNodeWithPosition {
  text: string;
  pos: number;
}

const getRegex = (
  searchString: string,
  disableRegex: boolean,
  caseSensitive: boolean
): RegExp => {
  if (!searchString.trim()) {
    // Return a regex that matches nothing for empty search terms
    return /(?!)/;
  }
  
  const escapedString = disableRegex
    ? searchString.replace(/[-/\\^$*+?.()|[\]{}]/g, "\"\\$&”")
    : searchString;
  return new RegExp(escapedString, caseSensitive ? "gu" : "gui");
};

interface ProcessedSearches {
  decorationsToReturn: DecorationSet;
  results: Range[];
}

function processSearches(
  doc: PMNode,
  searchTerm: RegExp,
  selectedResultIndex: number,
  searchResultClass: string,
  selectedResultClass: string
): ProcessedSearches {
  const decorations: Decoration[] = [];
  const results: Range[] = [];
  const textNodesWithPosition: TextNodeWithPosition[] = [];

  if (!searchTerm || searchTerm.source === "(?!)") {
    return { decorationsToReturn: DecorationSet.empty, results: [] };
  }

  doc.descendants((node, pos) => {
    if (node.isText) {
      textNodesWithPosition.push({ text: node.text || "", pos });
    }
  });

  for (const { text, pos } of textNodesWithPosition) {
    const matches = Array.from(text.matchAll(searchTerm)).filter(
      ([matchText]) => matchText.trim()
    );

    for (const match of matches) {
      if (match.index !== undefined) {
        results.push({
          from: pos + match.index,
          to: pos + match.index + match[0].length,
        });
      }
    }
  }

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (!result) continue;
    const { from, to } = result;
    decorations.push(
      Decoration.inline(from, to, {
        class:
          selectedResultIndex === i ? selectedResultClass : searchResultClass,
      })
    );
  }

  return {
    decorationsToReturn: DecorationSet.create(doc, decorations),
    results,
  };
}

const replace = (
  replaceTerm: string,
  results: Range[],
  selectedResult: number,
  { state, dispatch }: { state: EditorState; dispatch?: (tr: Transaction) => void }
) => {
  // Use the selected result instead of always the first one
  const targetResult = results[selectedResult];

  if (!targetResult) {
    return;
  }

  const { from, to } = targetResult;

  if (dispatch) {
    dispatch(state.tr.insertText(replaceTerm, from, to));
  }
};

const replaceAll = (
  replaceTerm: string,
  results: Range[],
  { tr, dispatch }: { tr: Transaction; dispatch?: (tr: Transaction) => void }
) => {
  if (!results.length) {
    return;
  }

  // Process replacements in reverse order to maintain position accuracy
  for (let i = results.length - 1; i >= 0; i--) {
    const result = results[i];
    if (!result) continue;
    const { from, to } = result;
    tr.insertText(replaceTerm, from, to);
  }

  if (dispatch) {
    dispatch(tr);
  }
};

const selectNext = (editor: CoreEditor) => {
  const { results } = editor.storage
    .searchAndReplace as SearchAndReplaceStorage;

  if (!results.length) {
    return;
  }

  const { selectedResult } = editor.storage.searchAndReplace;

  if (selectedResult >= results.length - 1) {
    editor.storage.searchAndReplace.selectedResult = 0;
  } else {
    editor.storage.searchAndReplace.selectedResult += 1;
  }

  const result = results[editor.storage.searchAndReplace.selectedResult];
  if (!result) return;

  const { from } = result;

  const view: EditorView | undefined = editor.view;

  if (view) {
    try {
      const domPos = view.domAtPos(from);
      if (domPos && domPos.node) {
        // Use a more reliable scrolling method
        const element = domPos.node.nodeType === Node.ELEMENT_NODE 
          ? domPos.node as Element
          : domPos.node.parentElement;
        
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    } catch (error) {
      console.warn("Failed to scroll to search result:", error);
    }
  }
};

const selectPrevious = (editor: CoreEditor) => {
  const { results } = editor.storage.searchAndReplace;

  if (!results.length) {
    return;
  }

  const { selectedResult } = editor.storage.searchAndReplace;

  if (selectedResult <= 0) {
    editor.storage.searchAndReplace.selectedResult = results.length - 1;
  } else {
    editor.storage.searchAndReplace.selectedResult -= 1;
  }

  const result = results[editor.storage.searchAndReplace.selectedResult];
  if (!result) return;
  
  const { from } = result;

  const view: EditorView | undefined = editor.view;

  if (view) {
    try {
      const domPos = view.domAtPos(from);
      if (domPos && domPos.node) {
        // Use a more reliable scrolling method
        const element = domPos.node.nodeType === Node.ELEMENT_NODE 
          ? domPos.node as Element
          : domPos.node.parentElement;
        
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    } catch (error) {
      console.warn("Failed to scroll to search result:", error);
    }
  }
};

export const searchAndReplacePluginKey = new PluginKey(
  "searchAndReplacePlugin"
);

export interface SearchAndReplaceOptions {
  searchResultClass: string;
  selectedResultClass: string;
  disableRegex: boolean;
}

export interface SearchAndReplaceStorage {
  searchTerm: string;
  replaceTerm: string;
  results: Range[];
  lastSearchTerm: string;
  selectedResult: number;
  lastSelectedResult: number;
  caseSensitive: boolean;
  lastCaseSensitiveState: boolean;
}

export const SearchAndReplace = Extension.create< 
  SearchAndReplaceOptions,
  SearchAndReplaceStorage
>(
  {
    name: "searchAndReplace",

    addOptions() {
      return {
        searchResultClass: "bg-yellow-200",
        selectedResultClass: "bg-yellow-500",
        disableRegex: true,
      };
    },

    addStorage() {
      return {
        searchTerm: "",
        replaceTerm: "",
        results: [],
        lastSearchTerm: "",
        selectedResult: 0,
        lastSelectedResult: 0,
        caseSensitive: false,
        lastCaseSensitiveState: false,
      };
    },

    addCommands() {
      return {
        setSearchTerm:
          (searchTerm: string) =>
          ({ editor }) => {
            editor.storage.searchAndReplace.searchTerm = searchTerm;
            // Reset selected result when search term changes
            editor.storage.searchAndReplace.selectedResult = 0;
            return false;
          },
        setReplaceTerm:
          (replaceTerm: string) =>
          ({ editor }) => {
            editor.storage.searchAndReplace.replaceTerm = replaceTerm;
            return false;
          },
        replace:
          () =>
          ({ editor, state, dispatch }) => {
            const { replaceTerm, results, selectedResult } = editor.storage.searchAndReplace;

            replace(replaceTerm, results, selectedResult, { state, dispatch });

            return false;
          },
        replaceAll:
          () =>
          ({ editor, tr, dispatch }) => {
            const { replaceTerm, results } = editor.storage.searchAndReplace;

            replaceAll(replaceTerm, results, { tr, dispatch });

            return false;
          },
        selectNextResult:
          () =>
          ({ editor }) => {
            selectNext(editor);
            return false;
          },
        selectPreviousResult:
          () =>
          ({ editor }) => {
            selectPrevious(editor);
            return false;
          },
        setCaseSensitive:
          (caseSensitive: boolean) =>
          ({ editor }) => {
            editor.storage.searchAndReplace.caseSensitive = caseSensitive;
            // Reset selected result when case sensitivity changes
            editor.storage.searchAndReplace.selectedResult = 0;
            return false;
          },
      };
    },

    addProseMirrorPlugins() {
      const editor = this.editor;
      const { searchResultClass, selectedResultClass, disableRegex } =
        this.options;

      const setLastSearchTerm = (t: string) => {
        editor.storage.searchAndReplace.lastSearchTerm = t;
      };

      const setLastSelectedResult = (r: number) => {
        editor.storage.searchAndReplace.lastSelectedResult = r;
      };

      const setLastCaseSensitiveState = (s: boolean) => {
        editor.storage.searchAndReplace.lastCaseSensitiveState = s;
      };

      return [
        new Plugin({
          key: searchAndReplacePluginKey,
          state: {
            init: () => DecorationSet.empty,
            apply({doc, docChanged}, oldState) {
              const {
                searchTerm,
                selectedResult,
                lastSearchTerm,
                lastSelectedResult,
                caseSensitive,
                lastCaseSensitiveState,
              } = editor.storage.searchAndReplace;

              if (
                !docChanged &&
                lastSearchTerm === searchTerm &&
                selectedResult === lastSelectedResult &&
                lastCaseSensitiveState === caseSensitive
              ) {
                return oldState;
              }

              setLastSearchTerm(searchTerm);
              setLastSelectedResult(selectedResult);
              setLastCaseSensitiveState(caseSensitive);

              if (!searchTerm || !searchTerm.trim()) {
                editor.storage.searchAndReplace.selectedResult = 0;
                editor.storage.searchAndReplace.results = [];
                return DecorationSet.empty;
              }

              const { decorationsToReturn, results } = processSearches(
                doc,
                getRegex(searchTerm, disableRegex, caseSensitive),
                selectedResult,
                searchResultClass,
                selectedResultClass
              );

              editor.storage.searchAndReplace.results = results;

              // Fix the selectedResult bounds checking
              if (selectedResult >= results.length && results.length > 0) {
                editor.storage.searchAndReplace.selectedResult = results.length - 1;
              } else if (results.length === 0) {
                editor.storage.searchAndReplace.selectedResult = 0;
              }

              return decorationsToReturn;
            },
          },
          props: {
            decorations(state) {
              return this.getState(state);
            },
          },
        }),
      ];
    },
  }
);

export default SearchAndReplace;