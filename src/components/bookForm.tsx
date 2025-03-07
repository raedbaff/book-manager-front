import {
  ApolloError,
  ApolloQueryResult,
  gql,
  OperationVariables,
  useMutation,
  useQuery,
} from "@apollo/client";
import { FormEvent, useEffect, useState } from "react";
import { fetchBooksResponse } from "../types";
import { toaster } from "./ui/toaster";

const BookForm = ({
  refresh,
  editMode,
  id,
  toggleEditMode,
}: {
  refresh: (
    variables?: Partial<OperationVariables> | undefined
  ) => Promise<ApolloQueryResult<fetchBooksResponse>>;
  editMode: boolean;
  id: number | null;
  toggleEditMode: (value: boolean) => void;
}) => {

  // QUERIES
  const CREATE_BOOK = gql`
    mutation CREATEBOOK($name: String!, $description: String!) {
      createBook(data: { name: $name, description: $description }) {
        id
        name
        description
      }
    }
  `;
  const GET_BOOK = gql`
    query FINDBOOK($id: Float!) {
      findOneBook(id: $id) {
        id
        name
        description
      }
    }
  `;
  const EDIT_BOOK = gql`
    mutation UPDATE($id: Float!, $name: String!, $description: String!) {
      updateBook(id: $id, data: { name: $name, description: $description }) {
        id
        name
        description
      }
    }
  `;

  // QUERIES

  // STATES
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  // STATES

  // GRAPHQL FUNCTIONS
  const [createBook, { data, loading, error }] = useMutation(CREATE_BOOK, {
    onCompleted: () => {
      setName("");
      setDescription("");
      setNameError("");
      setDescription("");
      refresh();
    },
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
  const [editBook, { data: editData, loading: editLoading, error: editError }] =
    useMutation(EDIT_BOOK, {
      onCompleted: () => {
        toggleEditMode(false);
        setDescription("");
        setName("");
        setNameError("");
        setDescriptionError("");
        refresh();
      },
    });

  const { data: bookData } = useQuery(GET_BOOK, {
    skip: !editMode,
    variables: { id },
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

  // GRAPHQL FUNCTIONS

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameError("");
    if (e.target.value.length < 3 || e.target.value.length > 20) {
      setNameError("Name must be between 3 and 20 characters");
    }
    setName(e.target.value);
  };
  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescriptionError("");
    if (e.target.value.length < 3 || e.target.value.length > 100) {
      setDescriptionError("Description must be between 3 and 100 characters");
    }
    setDescription(e.target.value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editMode) {
      editBook({
        variables: {
          id,
          name,
          description,
        },
      });
    } else {
      createBook({
        variables: {
          name,
          description,
        },
      });
    }
  };
  const cancelSubmission = () => {
    setName("");
    setNameError("")
    setDescription("");
    setDescriptionError("")
    toggleEditMode(false);
  };

  useEffect(() => {
    if (bookData) {
      setName(bookData.findOneBook.name);
      setDescription(bookData.findOneBook.description);
    }
  }, [bookData]);

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="book-form">
        <div className="form-group">
          <label htmlFor="bookName">Name</label>
          <input
            onChange={handleNameChange}
            type="text"
            id="bookName"
            value={name}
            placeholder="Enter book name"
          />
          {nameError && <span className="error">{nameError}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="bookDescription">Description</label>
          <textarea
            onChange={handleDescriptionChange}
            id="bookDescription"
            value={description}
            placeholder="Enter book description"
          ></textarea>
          {descriptionError && (
            <span className="error">{descriptionError}</span>
          )}
        </div>
        <div className="button-group">
          <button
            onClick={cancelSubmission}
            type="button"
            className="cancel-button"
          >
            Cancel
          </button>
          <button
            style={{
              cursor:
                loading ||
                !name ||
                !description ||
                nameError.length > 0 ||
                descriptionError.length > 0
                  ? "not-allowed"
                  : "pointer",
            }}
            disabled={
              loading ||
              editLoading ||
              !name ||
              !description ||
              nameError.length > 0 ||
              descriptionError.length > 0
            }
            type="submit"
            className="create-button"
          >
            {editMode ? "Edit" : "Create"}
          </button>
        </div>
        {error && <span className="error">Something went wrong !</span>}
      </form>
    </div>
  );
};

export default BookForm;
