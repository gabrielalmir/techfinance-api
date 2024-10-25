package utils

func MaxInt(numbers ...int) int {
	max := numbers[0]

	for _, number := range numbers {
		if number > max {
			max = number
		}
	}

	return max
}
