import pandas as pd


def mount_correction(correction, additional_info):
    return ("Um, actually, " + correction[0].lower() + correction[1:] + " " + additional_info).replace('  ', ' ')


def main():
    file_path = 'C:\\Users\\Lucas\\Test\\nitpicking\\nitpicking\\files\\booster_pack.xlsx'

    df = pd.read_excel(file_path)

    return_file = []
    for ind in df.index:
        line = {
            "author": "By " + df['Written By'][ind],
            "title": df['Title'][ind],
            "category": df['Category'][ind],
            "phrase_text": df['Statement'][ind],
            "error": df['Incorrect Portion'][ind],
            "correction": mount_correction(df['Correction'][ind], df['Additional Info'][ind]),
        }
        return_file.append(line)

    with open('files/booster_pack.json', 'w', encoding='utf-8') as f:
        f.write(str(return_file))


if __name__ == "__main__":
    main()
