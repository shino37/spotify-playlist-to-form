import process from "node:process";
import { authenticate } from "@google-cloud/local-auth";
import "dotenv/config";
import type { formatedTrack } from "./main.js";

const SCOPES = [
  "https://www.googleapis.com/auth/forms.body", // フォーム作成・編集
];

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

const credentialsPath = requiredEnv("CREDENTIALS_PATH");

export async function createForms(title: string, description: string, tracks: formatedTrack[]) {
  // 1回目実行時：ブラウザが開いて Google ログイン→許可
  const auth = await authenticate({
    keyfilePath: credentialsPath,
    scopes: SCOPES,
  });

  try {
    const createRes = await auth.request({
      url: 'https://forms.googleapis.com/v1/forms',
      method: 'POST',
      data: {
        info: {
          title: title,
        }
      }
    });

    const updateInfoRes = await auth.request({
      url: `https://forms.googleapis.com/v1/forms/${(createRes.data as any).formId}:batchUpdate`,
      method: 'POST',
      data: {
        requests: [
          {
            updateFormInfo: {
              info: {
                description: description,
              },
              updateMask: 'description',
            }
          }
        ]
      }
    });

    for (let i = 0; i < 5; i++) {
      const updateItemRes = await auth.request({
        url: `https://forms.googleapis.com/v1/forms/${(createRes.data as any).formId}:batchUpdate`,
        method: 'POST',
        data: {
          requests: [
            {
              createItem: {
                item: {
                  title: `${i + 1}位（${5 - i}点）`,
                  questionItem: {
                    question: {
                      required: true,
                      choiceQuestion: {
                        type: "DROP_DOWN",
                        options: tracks.map(track => ({
                          value: `${track.index}. ${track.name} - ${track.artists} (added by: ${track.addedBy || "Unknown"})`
                        })),
                      }
                    }
                  }
                },
                location: {
                  index: i
                }
              }
            }
          ]
        }
      });
    }

    console.log("create forms is successful");
  } catch (e: any) {
    console.error(JSON.stringify(e.response?.data, null, 2));
  }
}
