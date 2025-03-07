import {
  Box,
  Flex,
  Heading,
  Button,
  IconButton,
  Field,
  Input,
  Avatar,
  Text,
} from "@chakra-ui/react";
import { LuDelete, LuLogOut, LuPencilLine } from "react-icons/lu";
import "./App.css";
import BookForm from "./components/bookForm";
import { gql, useMutation, useQuery } from "@apollo/client";
import { fetchBooksResponse } from "./types";
import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Toaster, toaster } from "./components/ui/toaster";

function App() {
  const GET_BOOKS = gql`
    query {
      findAllBooks {
        id
        name
        description
      }
    }
  `;
  const DELETE_BOOK = gql`
    mutation DELETE($id: Float!) {
      deleteBook(id: $id)
    }
  `;
  const DELETE_All_BOOKS = gql`
    mutation {
      deleteAllBooks
    }
  `;

  const { data, refetch } = useQuery<fetchBooksResponse>(
    GET_BOOKS,
    {
      onCompleted: (data) => setBooks(data.findAllBooks),
      onError: (error) => {
        if (error.graphQLErrors) {
          error.graphQLErrors.forEach(({ message, extensions }) => {
            if (extensions?.code === "UNAUTHENTICATED") {
              toaster.create({
                title: `Unauthorized`,
                type: "error",
                duration: 5000,
              });
            } else {
              console.log(message);
            }
          });
        }

        if (error.networkError) {
          console.log("Network error", error.networkError);
        }
      },
    }
  );

  const {
    loginWithRedirect,
    user,
    isAuthenticated,
    isLoading,
    logout,
    getAccessTokenSilently,
  } = useAuth0();
  const [editMode, setEditMode] = useState(false);
  const [id, setId] = useState<number | null>(null);

  const [deleteTheBook, { loading: deleteLoading }] =
    useMutation(DELETE_BOOK, {
      onCompleted: () => refetch(),
      onError: (error) => {
        console.log(
          "An error occurred",
          error.networkError,
          error.graphQLErrors,
          error.message
        );

        if (error.graphQLErrors) {
          error.graphQLErrors.forEach(({ message, extensions }) => {
            if (extensions?.code === "UNAUTHENTICATED") {
              toaster.create({
                title: `Unauthorized`,
                type: "error",
                duration: 5000,
              });
            } else {
              console.log(message);
            }
          });
        }

        if (error.networkError) {
          console.log("Network error", error.networkError);
        }
      },
    });

  const [deleteAllBooks, { loading: deleteAllLoading }] =
    useMutation(DELETE_All_BOOKS, {
      onCompleted: () => refetch(),
      onError: (error) => {
        console.log(
          "An error occurred",
          error.networkError,
          error.graphQLErrors,
          error.message
        );

        if (error.graphQLErrors) {
          error.graphQLErrors.forEach(({ message, extensions }) => {
            if (extensions?.code === "UNAUTHENTICATED") {
              toaster.create({
                title: `Unauthorized`,
                type: "error",
                duration: 5000,
              });
            } else {
              console.log(message);
            }
          });
        }

        if (error.networkError) {
          console.log("Network error", error.networkError);
        }
      },
    });

  const [filterQuery, setFilterQuery] = useState("");
  const [books, setBooks] = useState<
    { id: number; name: string; description: string }[]
  >([]);

  const toggleEditMode = (value: boolean) => {
    setEditMode(value);
  };

  const enableEditMode = (id: number) => {
    setEditMode(true);
    setId(id);
    window.scroll({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  const onDeleteBook = (id: number) => {
    const book = books.find((book) => book.id === id);
    const confirm = window.confirm(
      `Are you sure you want to delete ${book?.name} book ?`
    );
    if (!confirm) {
      return;
    }
    deleteTheBook({
      variables: {
        id,
      },
    });
  };
  const onDeleteAllBooks = () => {
    const confirm = window.confirm(
      "Are you sure you want to delete all books?"
    );
    if (confirm) {
      deleteAllBooks();
    }
  };

  useEffect(() => {
    setBooks(
      data?.findAllBooks.filter((book) =>
        book.name.toLowerCase().includes(filterQuery.toLowerCase())
      ) || []
    );
  }, [filterQuery, data]);
  useEffect(() => {
    const getUserMetadata = async () => {
      try {
        const accessToken = await getAccessTokenSilently({});
        if (accessToken) localStorage.setItem("accessToken", accessToken);
      } catch (e) {
        console.log(e);
      }
    };

    getUserMetadata();
  }, [getAccessTokenSilently, user?.sub]);

  return (
    <Box>
      {/* Navbar */}
      <Flex
        bg="teal.500"
        p={4}
        color="white"
        justifyContent="space-between"
        alignItems="center"
      >
        <Heading size="lg">Book Management Dashboard</Heading>
        {isLoading && <div>Loading...</div>}
        {isAuthenticated && (
          <Flex gap={8}>
            <Avatar.Root>
              <Avatar.Fallback name={user?.given_name} />
              <Avatar.Image src={user?.picture} />
            </Avatar.Root>
            <IconButton
              onClick={() => {
                logout();
                localStorage.removeItem("accessToken");
              }}
            >
              <LuLogOut />
            </IconButton>
          </Flex>
        )}
        {!isAuthenticated && (
          <Button
            onClick={() => loginWithRedirect()}
            colorScheme="teal"
            variant="outline"
          >
            Login
          </Button>
        )}
      </Flex>
      <Toaster />

      {isAuthenticated && user && (
        <Flex w={"100%"}>
          <Text
            m={"auto"}
            textTransform={"uppercase"}
            fontSize="5xl"
            color={"teal.500"}
            p={4}
          >
            Welcome {user?.given_name}{" "}
          </Text>
        </Flex>
      )}

      <BookForm
        id={id}
        editMode={editMode}
        refresh={refetch}
        toggleEditMode={toggleEditMode}
      />

      <div className="table_wrapper">
        <Flex w={"100%"} justifyContent={"center"} gap={4}>
          <Field.Root w={"50%"} color={"teal"}>
            <Input
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              borderColor={"teal.500"}
              placeholder="Search Books By Name ..."
            />
          </Field.Root>
          <IconButton
            onClick={onDeleteAllBooks}
            disabled={deleteAllLoading}
            color={"white"}
            p={2}
            background={"red.500"}
            aria-label="Delete"
          >
            <LuDelete />
            Delete All Books
          </IconButton>
        </Flex>

        {/* Book List */}
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th style={{ width: "70%" }}>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>{book.id}</td>
                <td>{book.name}</td>
                <td>{book.description}</td>
                <td>
                  <IconButton
                    disabled={!isAuthenticated}
                    cursor={isAuthenticated ? "pointer" : "not-allowed"}
                    bg={"teal.500"}
                    style={{ marginRight: "10px" }}
                    aria-label="Edit"
                    onClick={() => enableEditMode(book.id)}
                  >
                    <LuPencilLine />
                  </IconButton>
                  <IconButton
                    disabled={deleteLoading || !isAuthenticated}
                    cursor={isAuthenticated ? "pointer" : "not-allowed"}
                    onClick={() => onDeleteBook(book.id)}
                    background={"red.500"}
                    aria-label="Delete"
                  >
                    <LuDelete />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Box>
  );
}

export default App;
