/* tslint:disable */
/* eslint-disable */
import { GraphQLResolveInfo } from 'graphql';
/**
 * This file is auto-generated by graphql-schema-typescript
 * Please note that any changes in this file may be overwritten
 */
 

/*******************************
 *                             *
 *          TYPE DEFS          *
 *                             *
 *******************************/
export interface GQLQuiz {
  quizId: string;
  topic: string;
  title: string;
  questions: Array<GQLQuizQuestion>;
}

export interface GQLQuizQuestion {
  questionText: string;
  options: Array<GQLQuizQuestionOptions | null>;
}

export interface GQLQuizQuestionOptions {
  optionText: string;
  isCorrect?: boolean;
}

export interface GQLQuizInput {
  topic: string;
  title: string;
  questions?: Array<GQLQuizInputQuestion>;
}

export interface GQLQuizInputQuestion {
  questionText: string;
  options: Array<GQLQuizInputQuestionOptions | null>;
}

export interface GQLQuizInputQuestionOptions {
  optionText: string;
  isCorrect?: boolean;
}

export interface GQLQuery {
  quizList: Array<GQLQuiz>;
  topicList: Array<string>;
  testLambda: string;
}

export interface GQLMutation {
  addQuiz: GQLQuiz;
}

export interface GQLScore {
  dummy?: string;
}

/*********************************
 *                               *
 *         TYPE RESOLVERS        *
 *                               *
 *********************************/
/**
 * This interface define the shape of your resolver
 * Note that this type is designed to be compatible with graphql-tools resolvers
 * However, you can still use other generated interfaces to make your resolver type-safed
 */
export interface GQLResolver {
  Quiz?: GQLQuizTypeResolver;
  QuizQuestion?: GQLQuizQuestionTypeResolver;
  QuizQuestionOptions?: GQLQuizQuestionOptionsTypeResolver;
  Query?: GQLQueryTypeResolver;
  Mutation?: GQLMutationTypeResolver;
  Score?: GQLScoreTypeResolver;
}
export interface GQLQuizTypeResolver<TParent = any> {
  quizId?: QuizToQuizIdResolver<TParent>;
  topic?: QuizToTopicResolver<TParent>;
  title?: QuizToTitleResolver<TParent>;
  questions?: QuizToQuestionsResolver<TParent>;
}

export interface QuizToQuizIdResolver<TParent = any, TResult = any> {
  (parent: TParent, args: {}, context: any, info: GraphQLResolveInfo): TResult;
}

export interface QuizToTopicResolver<TParent = any, TResult = any> {
  (parent: TParent, args: {}, context: any, info: GraphQLResolveInfo): TResult;
}

export interface QuizToTitleResolver<TParent = any, TResult = any> {
  (parent: TParent, args: {}, context: any, info: GraphQLResolveInfo): TResult;
}

export interface QuizToQuestionsResolver<TParent = any, TResult = any> {
  (parent: TParent, args: {}, context: any, info: GraphQLResolveInfo): TResult;
}

export interface GQLQuizQuestionTypeResolver<TParent = any> {
  questionText?: QuizQuestionToQuestionTextResolver<TParent>;
  options?: QuizQuestionToOptionsResolver<TParent>;
}

export interface QuizQuestionToQuestionTextResolver<TParent = any, TResult = any> {
  (parent: TParent, args: {}, context: any, info: GraphQLResolveInfo): TResult;
}

export interface QuizQuestionToOptionsResolver<TParent = any, TResult = any> {
  (parent: TParent, args: {}, context: any, info: GraphQLResolveInfo): TResult;
}

export interface GQLQuizQuestionOptionsTypeResolver<TParent = any> {
  optionText?: QuizQuestionOptionsToOptionTextResolver<TParent>;
  isCorrect?: QuizQuestionOptionsToIsCorrectResolver<TParent>;
}

export interface QuizQuestionOptionsToOptionTextResolver<TParent = any, TResult = any> {
  (parent: TParent, args: {}, context: any, info: GraphQLResolveInfo): TResult;
}

export interface QuizQuestionOptionsToIsCorrectResolver<TParent = any, TResult = any> {
  (parent: TParent, args: {}, context: any, info: GraphQLResolveInfo): TResult;
}

export interface GQLQueryTypeResolver<TParent = any> {
  quizList?: QueryToQuizListResolver<TParent>;
  topicList?: QueryToTopicListResolver<TParent>;
  testLambda?: QueryToTestLambdaResolver<TParent>;
}

export interface QueryToQuizListArgs {
  topic: string;
}
export interface QueryToQuizListResolver<TParent = any, TResult = any> {
  (parent: TParent, args: QueryToQuizListArgs, context: any, info: GraphQLResolveInfo): TResult;
}

export interface QueryToTopicListResolver<TParent = any, TResult = any> {
  (parent: TParent, args: {}, context: any, info: GraphQLResolveInfo): TResult;
}

export interface QueryToTestLambdaArgs {
  value: string;
}
export interface QueryToTestLambdaResolver<TParent = any, TResult = any> {
  (parent: TParent, args: QueryToTestLambdaArgs, context: any, info: GraphQLResolveInfo): TResult;
}

export interface GQLMutationTypeResolver<TParent = any> {
  addQuiz?: MutationToAddQuizResolver<TParent>;
}

export interface MutationToAddQuizArgs {
  input: GQLQuizInput;
}
export interface MutationToAddQuizResolver<TParent = any, TResult = any> {
  (parent: TParent, args: MutationToAddQuizArgs, context: any, info: GraphQLResolveInfo): TResult;
}

export interface GQLScoreTypeResolver<TParent = any> {
  dummy?: ScoreToDummyResolver<TParent>;
}

export interface ScoreToDummyResolver<TParent = any, TResult = any> {
  (parent: TParent, args: {}, context: any, info: GraphQLResolveInfo): TResult;
}
