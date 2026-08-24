import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import DashboardPage from "../src/pages/DashboardPage";
import NoteEditorPage from "../src/pages/NoteEditorPage";
import { extractText } from "../src/lib/tiptapText";
import apiClient from "../src/services/apiClient";

const mockEditor = {
  commands: { setContent: jest.fn() },
  getJSON: jest.fn(() => ({ type: "doc", content: [] })),
};

jest.mock("../src/services/apiClient", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));
jest.mock("@tiptap/react", () => ({
  __esModule: true,
  useEditor: jest.fn(() => mockEditor),
  EditorContent: () => <div data-testid="editor-content" />,
}));
jest.mock("@tiptap/starter-kit", () => ({
  __esModule: true,
  default: { configure: () => ({}) },
}));
jest.mock("@tiptap/extension-underline", () => ({
  __esModule: true,
  default: {},
}));
jest.mock("@tiptap/extension-link", () => ({
  __esModule: true,
  default: { configure: () => ({}) },
}));
jest.mock("@tiptap/extension-text-align", () => ({
  __esModule: true,
  default: { configure: () => ({}) },
}));
jest.mock("@tiptap/extension-color", () => ({ __esModule: true, default: {} }));
jest.mock("@tiptap/extension-highlight", () => ({
  __esModule: true,
  default: { configure: () => ({}) },
}));
jest.mock("@tiptap/extension-image", () => ({
  __esModule: true,
  default: { configure: () => ({}) },
}));
jest.mock("@tiptap/extension-task-list", () => ({
  __esModule: true,
  default: {},
}));
jest.mock("@tiptap/extension-task-item", () => ({
  __esModule: true,
  default: { configure: () => ({}) },
}));
jest.mock("@tiptap/extension-font-family", () => ({
  __esModule: true,
  default: {},
}));
jest.mock("@tiptap/extension-text-style", () => ({
  __esModule: true,
  FontSize: {},
  TextStyle: {},
}));
jest.mock("../src/components/EditorToolbar", () => ({
  __esModule: true,
  default: () => <div data-testid="editor-toolbar" />,
}));

function LocationProbe() {
  return <output data-testid="location">{useLocation().pathname}</output>;
}

function renderWithRouter(element, initialEntries = ["/"]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/notes/new" element={element} />
        <Route path="/notes/:id" element={element} />
        <Route path="*" element={element} />
      </Routes>
      <LocationProbe />
    </MemoryRouter>,
  );
}

async function runWorkflow(context, workflow) {
  try {
    await workflow();
  } catch (error) {
    console.error(`${context} failed`, error);
    throw error;
  }
}

function AuthProbe() {
  const { user, login, signup, logout } = useAuth();
  return (
    <div>
      <output data-testid="auth-user">{user?.email || "signed out"}</output>
      <button
        onClick={() => login("ada@example.com", "secret").catch(() => {})}
      >
        Login
      </button>
      <button onClick={() => signup("Ada", "ada@example.com", "secret")}>
        Signup
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  window.confirm = jest.fn();
});

describe("extractText", () => {
  it("extracts nested text and handles empty documents", () => {
    expect(extractText()).toBe("");
    expect(extractText({ text: "Hello" })).toBe("Hello");
    expect(
      extractText({
        content: [{ text: "Hello" }, { content: [{ text: "world" }] }],
      }),
    ).toBe("Hello world");
    expect(extractText({ content: [] })).toBe("");
  });
});

describe("AuthProvider", () => {
  it("handles login, signup, logout, and login failure", async () => {
    await runWorkflow("Authentication workflow", async () => {
      apiClient.post
        .mockResolvedValueOnce({
          data: { data: { user: { email: "ada@example.com" } } },
        })
        .mockResolvedValueOnce({
          data: { data: { user: { email: "new@example.com" } } },
        })
        .mockResolvedValueOnce({});
      render(
        <AuthProvider>
          <AuthProbe />
        </AuthProvider>,
      );
      fireEvent.click(screen.getByRole("button", { name: "Login" }));
      await waitFor(() =>
        expect(screen.getByTestId("auth-user")).toHaveTextContent(
          "ada@example.com",
        ),
      );
      fireEvent.click(screen.getByRole("button", { name: "Signup" }));
      await waitFor(() =>
        expect(screen.getByTestId("auth-user")).toHaveTextContent(
          "new@example.com",
        ),
      );
      fireEvent.click(screen.getByRole("button", { name: "Logout" }));
      await waitFor(() =>
        expect(screen.getByTestId("auth-user")).toHaveTextContent("signed out"),
      );
      apiClient.post.mockRejectedValueOnce(new Error("failed"));
      fireEvent.click(screen.getByRole("button", { name: "Login" }));
      await waitFor(() =>
        expect(screen.getByTestId("auth-user")).toHaveTextContent("signed out"),
      );
    });
  });
});

describe("DashboardPage", () => {
  const notes = [
    {
      id: 1,
      title: "First note",
      content: { content: [{ text: "Body" }] },
      updated_at: "2026-01-01T00:00:00.000Z",
      is_pinned: false,
      is_archived: false,
      category: "Work",
    },
    {
      id: 2,
      title: "Second note",
      content: { content: [{ text: "More body" }] },
      updated_at: "2026-01-02T00:00:00.000Z",
      is_pinned: false,
      is_archived: false,
      category: "Personal",
    },
  ];

  it("loads notes and supports filtering, pinning, archiving, and deleting", async () => {
    await runWorkflow("Dashboard note-management workflow", async () => {
      apiClient.get.mockResolvedValue({ data: { data: { notes } } });
      apiClient.put
        .mockResolvedValueOnce({
          data: { data: { note: { ...notes[0], is_pinned: true } } },
        })
        .mockResolvedValueOnce({});
      apiClient.delete.mockResolvedValue({});
      window.confirm.mockReturnValue(true);
      renderWithRouter(<DashboardPage />);
      expect(
        await screen.findByRole("heading", { name: "First note" }),
      ).toBeInTheDocument();
      fireEvent.change(screen.getByPlaceholderText("Search title or content"), {
        target: { value: "first" },
      });
      expect(
        await screen.findByRole("heading", { name: "First note" }),
      ).toBeInTheDocument();
      fireEvent.click(screen.getAllByRole("button", { name: "Pin" })[0]);
      await waitFor(() =>
        expect(apiClient.put).toHaveBeenCalledWith("/notes/1", {
          is_pinned: true,
        }),
      );
      fireEvent.click(screen.getAllByRole("button", { name: "Archive" })[0]);
      await waitFor(() =>
        expect(apiClient.put).toHaveBeenCalledWith("/notes/1", {
          is_archived: true,
        }),
      );
      fireEvent.change(screen.getByPlaceholderText("Search title or content"), {
        target: { value: "" },
      });
      expect(
        await screen.findByRole("heading", { name: "Second note" }),
      ).toBeInTheDocument();
      const secondNoteCard = screen
        .getByRole("heading", { name: "Second note" })
        .closest(".paper-card");
      fireEvent.click(
        within(secondNoteCard).getByRole("button", { name: "Delete" }),
      );
      await waitFor(() =>
        expect(apiClient.delete).toHaveBeenCalledWith("/notes/2"),
      );
    });
  });

  it("shows an API error", async () => {
    await runWorkflow("Dashboard load-error workflow", async () => {
      apiClient.get.mockRejectedValue(new Error("network"));
      renderWithRouter(<DashboardPage />);
      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Could not load notes",
      );
    });
  });
});

describe("NoteEditorPage", () => {
  beforeEach(() => {
    mockEditor.commands.setContent.mockClear();
    mockEditor.getJSON.mockClear();
  });

  it("creates a note with metadata", async () => {
    await runWorkflow("Note-creation workflow", async () => {
      apiClient.post.mockResolvedValue({});
      renderWithRouter(<NoteEditorPage />, ["/notes/new"]);
      fireEvent.change(screen.getByPlaceholderText("Untitled"), {
        target: { value: "My note" },
      });
      fireEvent.change(screen.getByLabelText("Tags"), {
        target: { value: "work, ideas" },
      });
      fireEvent.change(screen.getByLabelText("Category"), {
        target: { value: "Work" },
      });
      fireEvent.click(screen.getByLabelText("Pin note"));
      fireEvent.submit(
        screen.getByRole("button", { name: "Save note" }).closest("form"),
      );
      await waitFor(() =>
        expect(apiClient.post).toHaveBeenCalledWith(
          "/notes",
          expect.objectContaining({
            title: "My note",
            tags: ["work", "ideas"],
            is_pinned: true,
          }),
        ),
      );
      expect(screen.getByTestId("location")).toHaveTextContent("/dashboard");
    });
  });

  it("loads, updates, and deletes an existing note", async () => {
    await runWorkflow("Note-update workflow", async () => {
      const note = {
        id: 3,
        title: "Loaded",
        content: { type: "doc", content: [] },
        tags: ["one"],
        category: "Work",
        is_pinned: false,
        is_archived: true,
      };
      apiClient.get.mockResolvedValue({ data: { data: { note } } });
      apiClient.put.mockResolvedValue({});
      apiClient.delete.mockResolvedValue({});
      window.confirm.mockReturnValue(true);
      renderWithRouter(<NoteEditorPage />, ["/notes/3"]);
      expect(await screen.findByDisplayValue("Loaded")).toBeInTheDocument();
      expect(mockEditor.commands.setContent).toHaveBeenCalledWith(note.content);
      fireEvent.change(screen.getByDisplayValue("Loaded"), {
        target: { value: "Updated" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Save note" }));
      await waitFor(() =>
        expect(apiClient.put).toHaveBeenCalledWith(
          "/notes/3",
          expect.objectContaining({ title: "Updated" }),
        ),
      );
    });
  });

  it("deletes an existing note after confirmation", async () => {
    await runWorkflow("Note-deletion workflow", async () => {
      apiClient.get.mockResolvedValue({
        data: { data: { note: { id: 3, title: "Delete me", content: {} } } },
      });
      apiClient.delete.mockResolvedValue({});
      window.confirm.mockReturnValue(true);
      renderWithRouter(<NoteEditorPage />, ["/notes/3"]);
      await screen.findByDisplayValue("Delete me");
      fireEvent.click(screen.getByRole("button", { name: "Delete note" }));
      await waitFor(() =>
        expect(apiClient.delete).toHaveBeenCalledWith("/notes/3"),
      );
    });
  });

  it("shows a load error", async () => {
    await runWorkflow("Note load-error workflow", async () => {
      apiClient.get.mockRejectedValueOnce(new Error("missing"));
      renderWithRouter(<NoteEditorPage />, ["/notes/4"]);
      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Note not found",
      );
    });
  });
});
