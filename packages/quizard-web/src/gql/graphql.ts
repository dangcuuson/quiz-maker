/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Mutation = {
  __typename?: 'Mutation';
  addQuiz: Quiz;
};


export type MutationAddQuizArgs = {
  input: QuizInput;
};

export type Query = {
  __typename?: 'Query';
  quizList: Array<Quiz>;
  testLambda: Scalars['String']['output'];
  topicList: Array<Scalars['String']['output']>;
};


export type QueryQuizListArgs = {
  topic: Scalars['String']['input'];
};


export type QueryTestLambdaArgs = {
  value: Scalars['String']['input'];
};

export type Quiz = {
  __typename?: 'Quiz';
  questions: Array<QuizQuestion>;
  quizId: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  topic: Scalars['String']['output'];
};

export type QuizInput = {
  questions?: InputMaybe<Array<QuizInputQuestion>>;
  title: Scalars['String']['input'];
  topic: Scalars['String']['input'];
};

export type QuizInputQuestion = {
  options: Array<InputMaybe<QuizInputQuestionOptions>>;
  questionText: Scalars['String']['input'];
};

export type QuizInputQuestionOptions = {
  isCorrect?: InputMaybe<Scalars['Boolean']['input']>;
  optionText: Scalars['String']['input'];
};

export type QuizQuestion = {
  __typename?: 'QuizQuestion';
  options: Array<Maybe<QuizQuestionOptions>>;
  questionText: Scalars['String']['output'];
};

export type QuizQuestionOptions = {
  __typename?: 'QuizQuestionOptions';
  isCorrect?: Maybe<Scalars['Boolean']['output']>;
  optionText: Scalars['String']['output'];
};

export type Score = {
  __typename?: 'Score';
  dummy?: Maybe<Scalars['String']['output']>;
};

export type MyQQueryVariables = Exact<{
  topic: Scalars['String']['input'];
}>;


export type MyQQuery = { __typename?: 'Query', testLambda: string, quizList: Array<{ __typename?: 'Quiz', quizId: string }> };


export const MyQDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyQ"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"topic"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quizList"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"topic"},"value":{"kind":"Variable","name":{"kind":"Name","value":"topic"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quizId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"testLambda"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"value"},"value":{"kind":"StringValue","value":"ABC","block":false}}]}]}}]} as unknown as DocumentNode<MyQQuery, MyQQueryVariables>;