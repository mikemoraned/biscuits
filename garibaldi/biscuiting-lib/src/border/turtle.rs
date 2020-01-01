#[derive(PartialEq, Debug)]
enum Direction {
    North,
    West,
    South,
    East,
}

#[derive(PartialEq, Debug)]
pub struct Turtle {
    pub x: i32,
    pub y: i32,
    direction: Direction,
}

impl Turtle {
    pub fn new(x: u32, y: u32) -> Turtle {
        Turtle {
            x: x as i32,
            y: y as i32,
            direction: Direction::East,
        }
    }

    pub fn left(&self) -> Turtle {
        use Direction::*;
        match self.direction {
            North => Turtle {
                x: self.x - 1,
                y: self.y,
                direction: West,
            },
            East => Turtle {
                x: self.x,
                y: self.y - 1,
                direction: North,
            },
            South => Turtle {
                x: self.x + 1,
                y: self.y,
                direction: East,
            },
            West => Turtle {
                x: self.x,
                y: self.y + 1,
                direction: South,
            },
        }
    }

    pub fn right(&self) -> Turtle {
        use Direction::*;
        match self.direction {
            North => Turtle {
                x: self.x + 1,
                y: self.y,
                direction: East,
            },
            East => Turtle {
                x: self.x,
                y: self.y + 1,
                direction: South,
            },
            South => Turtle {
                x: self.x - 1,
                y: self.y,
                direction: West,
            },
            West => Turtle {
                x: self.x,
                y: self.y - 1,
                direction: North,
            },
        }
    }
}
