export interface CarResponse {
  id: number;
  levelPath: string;
  triviaList: {
    id: number;
    triviaText: string;
    triviaCoordinates: {
      id: number;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    };
  }[],
  triviaQuestion: {
    id: number,
    question: string,
    answer: string
  }
}
